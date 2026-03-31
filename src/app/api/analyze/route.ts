import { auth, currentUser, verifyToken } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { api } from "../../../../convex/_generated/api";

export const maxDuration = 300;

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
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
		if (!process.env.OPENAI_API_KEY) {
			return NextResponse.json(
				{ error: "OpenAI API key not configured. Add OPENAI_API_KEY to environment variables." },
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
		let userId: string | null = null;

		// Try middleware-injected auth first (cookie-based)
		const authResult = await auth();
		userId = authResult.userId;

		// Fallback: verify Bearer token directly if cookie auth failed
		if (!userId) {
			const authHeader = request.headers.get("Authorization");
			if (authHeader?.startsWith("Bearer ")) {
				try {
					const token = authHeader.slice(7);
					const decoded = await verifyToken(token, {
						secretKey: process.env.CLERK_SECRET_KEY!,
					});
					userId = decoded.sub;
				} catch (e) {
					console.warn("Bearer token verification failed:", e);
				}
			}
		}

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required. Please sign in and try again." },
				{ status: 401 },
			);
		}

		// Fetch full user profile — non-blocking fallback if it fails
		let email = `${userId}@user`;
		let fullName: string | undefined;
		try {
			const user = await currentUser();
			if (user?.primaryEmailAddress?.emailAddress) {
				email = user.primaryEmailAddress.emailAddress;
			}
			fullName = user?.fullName || undefined;
		} catch (e) {
			console.warn("Could not fetch Clerk user profile, using fallback:", e);
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
			email,
			name: fullName,
		});

		if (!dbUser || dbUser.roastsRemaining <= 0) {
			return NextResponse.json(
				{
					needsPayment: true,
					error: "You've used all your free credits. More credits coming soon!",
				},
				{ status: 402 },
			);
		}

		const prompt = `You are a senior technical recruiter with 15+ years of experience who has reviewed 50,000+ resumes and knows exactly how ATS systems, hiring managers, and interview panels actually evaluate candidates. Analyze this job application. Be brutally honest, savage, and entertaining — but every single point must be specific, actionable, and backed by what you see in the resume vs. what the JD demands.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

ANALYSIS INSTRUCTIONS:

1. KEYWORD MATCHING: Extract every hard skill, technology, tool, certification, and domain keyword from the JD. For each one, check if the resume mentions it exactly, uses a synonym, or omits it entirely. ATS systems do literal string matching — synonyms often don't count.

2. FORMATTING & ATS COMPLIANCE: Evaluate whether the resume would survive an ATS parse. Check for: multi-column layouts, tables, headers/footers (ATS skips these), graphics/icons, unusual section headings, missing standard sections (Summary, Experience, Education, Skills), inconsistent date formats, and whether contact info is in the main body (not a header).

3. EXPERIENCE RELEVANCE: For each role listed, assess how directly it maps to the JD requirements. Flag experience gaps (e.g., JD asks for 5+ years of X but resume shows 2 years). Note if bullet points show impact with metrics vs. just listing duties.

4. BULLET QUALITY: Identify the weakest bullet points — ones that describe responsibilities instead of achievements, lack metrics, or use passive language. When rewriting, use the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]."

5. COMPETITION CONTEXT: Base your applicant estimates on the role's seniority, company type, and market conditions. A FAANG senior role gets 500+ applicants; a Series A startup mid-level role gets 50-150.

Return ONLY a JSON object with these fields:
{
  "grade": "A+ to F letter grade based on overall fit",
  "headline": "One-line brutal summary, funny but true, max 100 chars",
  "rejection": "2-3 paragraphs explaining exactly why this candidate would be rejected. Reference specific resume content vs. specific JD requirements. Name the gaps by quoting from both documents.",
  "recruiterNotes": [
    {"section": "Experience", "note": "Specific assessment of experience relevance, years, and seniority match. Quote the JD requirement and what the resume actually shows."},
    {"section": "Skills", "note": "Which required skills are demonstrated with evidence vs. just listed vs. completely missing. Call out buzzword-stuffing if present."},
    {"section": "Education", "note": "Whether education meets JD requirements. Flag if degree field doesn't match or if certifications are missing."},
    {"section": "Overall", "note": "The 6-second recruiter scan verdict — what stands out (good or bad) in the first glance."}
  ],
  "skillGapHeatmap": [{"skill": "exact skill/keyword from JD", "status": "missing|weak|strong", "jdMention": true, "resumeMention": true/false, "detail": "where/how it appears on resume, or why it's marked weak"}] (8-12 key requirements from the JD),
  "priorities": [{"rank": 1, "issue": "most impactful gap", "effort": "Low|Medium|High", "impact": "Low|Medium|High", "action": "exact step to fix this, not generic advice"}] (top 3),
  "competition": {"estimatedApplicants": number, "estimatedRank": number, "percentile": number, "competitionLevel": "Low|Medium|High|Extreme"},
  "bulletRewrite": {"before": "copy their weakest actual bullet verbatim", "after": "rewritten with metrics and XYZ formula", "why": "specific explanation of what changed and why it's stronger"},
  "atsScore": {
    "score": number (0-100),
    "issues": [{"category": "Keywords|Formatting|Sections|Length|Contact Info", "severity": "Critical|Warning|Minor", "issue": "specific problem found, not generic"}],
    "missingKeywords": ["exact keywords from JD not found in resume"],
    "tips": ["3 specific, actionable ATS optimization tips referencing this exact resume and JD"]
  },
  "hiringManagerQuote": "What the hiring manager probably said when reviewing this resume (funny, specific to this candidate)",
  "improvements": ["5 specific actionable improvements — each one should reference a concrete change to make, not generic advice like 'tailor your resume'. Example: 'Add a Projects section showcasing a distributed systems project since the JD emphasizes microservices experience you claim but don't demonstrate'"]
}`;

		// Stream response with heartbeats to prevent timeout
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				const heartbeat = setInterval(() => {
					controller.enqueue(encoder.encode("\n"));
				}, 10000);

				try {
					const completion = await openai.chat.completions.create({
						model: "gpt-5-mini",
						messages: [
							{
								role: "system",
								content: `You are a brutally honest hiring expert. Today's date is ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}. Respond with valid JSON only.`,
							},
							{
								role: "user",
								content: prompt,
							},
						],
						temperature: 1,
						max_completion_tokens: 8192,
						response_format: { type: "json_object" },
					});

					const content = completion.choices[0].message.content;
					if (!content) {
						throw new Error("No response from AI");
					}

					const analysis: Record<string, unknown> = JSON.parse(content);
					const resultId = nanoid(10);

					// Sanitize AI output to match Convex schema validators
					const sanitized = sanitizeAnalysis(analysis);

					const result = {
						resultId,
						clerkId: userId,
						email,
						...sanitized,
					};

					// Save result and deduct roast in parallel
					const [, roastResult] = await Promise.all([
						convex.mutation(api.results.save, result),
						convex.mutation(api.users.useRoast, { clerkId: userId }),
					]);

					// Send final JSON result
					controller.enqueue(
						encoder.encode(JSON.stringify({ id: resultId, remaining: roastResult.remaining })),
					);
				} catch (error) {
					console.error("Analysis error:", error);
					let errorMsg = "Analysis failed. Please try again.";
					if (error instanceof Error) {
						if (error.message.includes("API key")) {
							errorMsg = "AI service configuration error. Please try again later.";
						} else if (error.message.includes("quota") || error.message.includes("rate")) {
							errorMsg = "AI rate limit reached. Try again in a minute.";
						} else {
							errorMsg = `Analysis failed: ${error.message}`;
						}
					}
					controller.enqueue(encoder.encode(JSON.stringify({ error: errorMsg })));
				} finally {
					clearInterval(heartbeat);
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.error("Analysis error:", error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 });
	}
}
