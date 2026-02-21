import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

const openai = new OpenAI({
	apiKey: process.env.KIMI_API_KEY,
	baseURL: "https://api.moonshot.ai/v1",
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helpers to clamp AI values to valid schema enums
function clampTo<T extends string>(value: unknown, allowed: T[], fallback: T): T {
	if (typeof value === "string") {
		// Try exact match first
		if (allowed.includes(value as T)) return value as T;
		// Try case-insensitive match
		const lower = value.toLowerCase();
		const match = allowed.find((a) => a.toLowerCase() === lower);
		if (match) return match;
	}
	return fallback;
}

function sanitizeAnalysis(raw: Record<string, unknown>) {
	const effortImpact = ["Low", "Medium", "High"] as const;
	const competitionLevels = ["Low", "Medium", "High", "Extreme"] as const;
	const severities = ["Critical", "Warning", "Minor"] as const;
	const statuses = ["missing", "weak", "strong"] as const;

	// Sanitize skillGapHeatmap
	const skillGapHeatmap = Array.isArray(raw.skillGapHeatmap)
		? raw.skillGapHeatmap.map((s: Record<string, unknown>) => ({
				skill: String(s.skill || ""),
				status: clampTo(s.status, [...statuses], "weak"),
				jdMention: Boolean(s.jdMention),
				resumeMention: Boolean(s.resumeMention),
			}))
		: [];

	// Sanitize priorities
	const priorities = Array.isArray(raw.priorities)
		? raw.priorities.map((p: Record<string, unknown>) => ({
				rank: Number(p.rank) || 1,
				issue: String(p.issue || ""),
				effort: clampTo(p.effort, [...effortImpact], "Medium"),
				impact: clampTo(p.impact, [...effortImpact], "Medium"),
				action: String(p.action || ""),
			}))
		: [];

	// Sanitize competition
	const rawComp = (raw.competition || {}) as Record<string, unknown>;
	const competition = {
		estimatedApplicants: Number(rawComp.estimatedApplicants) || 150,
		estimatedRank: Number(rawComp.estimatedRank) || 75,
		percentile: Number(rawComp.percentile) || 50,
		competitionLevel: clampTo(rawComp.competitionLevel, [...competitionLevels], "Medium"),
	};

	// Sanitize atsScore
	const rawAts = (raw.atsScore || {}) as Record<string, unknown>;
	const atsScore = {
		score: Number(rawAts.score) || 50,
		issues: Array.isArray(rawAts.issues)
			? rawAts.issues.map((i: Record<string, unknown>) => ({
					category: String(i.category || "Keywords"),
					issue: String(i.issue || ""),
					severity: clampTo(i.severity, [...severities], "Warning"),
				}))
			: [],
		missingKeywords: Array.isArray(rawAts.missingKeywords)
			? rawAts.missingKeywords.map(String)
			: [],
		tips: Array.isArray(rawAts.tips) ? rawAts.tips.map(String) : [],
	};

	// Sanitize bulletRewrite
	const rawBullet = raw.bulletRewrite as Record<string, unknown> | null | undefined;
	const bulletRewrite = rawBullet
		? {
				before: String(rawBullet.before || ""),
				after: String(rawBullet.after || ""),
				why: String(rawBullet.why || ""),
			}
		: undefined;

	return {
		grade: String(raw.grade || "C"),
		headline: String(raw.headline || ""),
		rejection: String(raw.rejection || ""),
		hiringManagerQuote: String(raw.hiringManagerQuote || ""),
		improvements: Array.isArray(raw.improvements) ? raw.improvements.map(String) : [],
		skillGaps: skillGapHeatmap.filter((s) => s.status !== "strong").map((s) => s.skill),
		recruiterNotes: Array.isArray(raw.recruiterNotes)
			? raw.recruiterNotes.map((n: Record<string, unknown>) => ({
					section: String(n.section || ""),
					note: String(n.note || ""),
				}))
			: [],
		skillGapHeatmap,
		priorities,
		competition,
		bulletRewrite,
		atsScore,
	};
}

export async function POST(request: NextRequest) {
	try {
		// Rate limiting
		const ip = getIP(request);
		const rateLimitResult = await checkRateLimit(`analyze:${ip}`);
		
		if (!rateLimitResult.success) {
			return NextResponse.json(
				{ 
					error: "Too many requests. Please wait a minute before trying again.",
					retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
				},
				{ 
					status: 429,
					headers: {
						"X-RateLimit-Limit": rateLimitResult.limit.toString(),
						"X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
						"X-RateLimit-Reset": rateLimitResult.reset.toString(),
						"Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
					},
				},
			);
		}

		// Check API key
		if (!process.env.KIMI_API_KEY) {
			return NextResponse.json(
				{ error: "Kimi API key not configured. Add KIMI_API_KEY to environment variables." },
				{ status: 500 },
			);
		}

		// Check Convex URL
		if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
			return NextResponse.json(
				{ error: "Convex not configured. Add NEXT_PUBLIC_CONVEX_URL to environment variables." },
				{ status: 500 },
			);
		}

		// Get authenticated user from Clerk
		const { userId } = await auth();
		const user = await currentUser();
		
		if (!userId || !user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 },
			);
		}

		const email = user.primaryEmailAddress?.emailAddress;
		if (!email) {
			return NextResponse.json(
				{ error: "Email required" },
				{ status: 400 },
			);
		}

		const { resume, jobDescription } = await request.json();

		if (!resume || !jobDescription) {
			return NextResponse.json(
				{ error: "Resume and job description are required" },
				{ status: 400 },
			);
		}

		// Get or create user in Convex and check roasts remaining
		const dbUser = await convex.mutation(api.users.getOrCreate, {
			clerkId: userId,
			email: email,
			name: user.fullName || undefined,
		});

		if (!dbUser || dbUser.roastsRemaining <= 0) {
			return NextResponse.json(
				{ needsPayment: true, error: "No credits remaining. Contact us at saumyatiwari.29@gmail.com for more credits." },
				{ status: 402 },
			);
		}

		const prompt = `Analyze this job application as a brutally honest recruiter. Be savage but helpful, entertaining AND useful.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Return ONLY a JSON object with these fields:
{
  "grade": "A+ to F letter grade",
  "headline": "One-line brutal summary, funny but true, max 100 chars",
  "rejection": "2-3 paragraphs on why they didn't get the job. Specific and constructive.",
  "recruiterNotes": [{"section":"Experience","note":"..."},{"section":"Skills","note":"..."},{"section":"Education","note":"..."},{"section":"Overall","note":"..."}],
  "skillGapHeatmap": [{"skill":"skill name","status":"missing|weak|strong","jdMention":true,"resumeMention":false}] (6-10 key requirements),
  "priorities": [{"rank":1,"issue":"...","effort":"Low|Medium|High","impact":"Low|Medium|High","action":"..."}] (top 3),
  "competition": {"estimatedApplicants":number,"estimatedRank":number,"percentile":number,"competitionLevel":"Low|Medium|High|Extreme"},
  "bulletRewrite": {"before":"their weakest bullet","after":"rewritten version","why":"what's better"},
  "atsScore": {"score":number,"issues":[{"category":"Keywords|Formatting|Sections|Length|Contact Info","severity":"Critical|Warning|Minor","issue":"..."}],"missingKeywords":["..."],"tips":["3 tips"]},
  "hiringManagerQuote": "What the hiring manager probably said (funny)",
  "improvements": ["4-5 specific actionable tips"]
}`;

		const completion = await openai.chat.completions.create({
			model: "kimi-k2.5",
			messages: [
				{
					role: "system",
					content: "You are a brutally honest hiring expert. Respond with valid JSON only. No markdown, no code fences, no extra text.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 1,
			max_tokens: 4096,
		});

		let content = completion.choices[0].message.content;
		if (!content) {
			throw new Error("No response from AI");
		}

		// Strip markdown code fences if present
		content = content.trim();
		if (content.startsWith("```")) {
			content = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
		}

		const analysis = JSON.parse(content);
		const resultId = nanoid(10);

		// Sanitize AI output to match Convex schema validators
		const sanitized = sanitizeAnalysis(analysis);

		const result = {
			resultId,
			clerkId: userId,
			email,
			...sanitized,
		};

		// Save to Convex
		await convex.mutation(api.results.save, result);

		// Use a roast
		const roastResult = await convex.mutation(api.users.useRoast, { clerkId: userId });

		// Return the result ID for redirect
		return NextResponse.json({ 
			id: resultId,
			remaining: roastResult.remaining,
		});
	} catch (error) {
		console.error("Analysis error:", error);

		if (error instanceof Error) {
			if (error.message.includes("API key")) {
				return NextResponse.json({ error: "AI service configuration error. Please try again later." }, { status: 500 });
			}
			if (error.message.includes("quota") || error.message.includes("rate")) {
				return NextResponse.json({ error: "AI rate limit reached. Try again in a minute." }, { status: 429 });
			}
			if (error.message.includes("JSON")) {
				return NextResponse.json({ error: "AI returned an unexpected response. Please try again." }, { status: 500 });
			}
		}

		return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
	}
}
