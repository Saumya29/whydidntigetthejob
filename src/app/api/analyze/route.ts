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

		// Build the result object
		const result = {
			resultId,
			clerkId: userId,
			email,
			grade: analysis.grade,
			headline: analysis.headline,
			rejection: analysis.rejection,
			hiringManagerQuote: analysis.hiringManagerQuote,
			improvements: analysis.improvements || [],
			skillGaps: analysis.skillGapHeatmap?.filter((s: { status: string }) => s.status !== "strong").map((s: { skill: string }) => s.skill) || [],
			recruiterNotes: analysis.recruiterNotes || [],
			skillGapHeatmap: analysis.skillGapHeatmap || [],
			priorities: analysis.priorities || [],
			competition: analysis.competition || { estimatedApplicants: 150, estimatedRank: 75, percentile: 50, competitionLevel: "Medium" as const },
			bulletRewrite: analysis.bulletRewrite || null,
			atsScore: analysis.atsScore || { score: 50, issues: [], missingKeywords: [], tips: [] },
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
				return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
			}
			if (error.message.includes("quota") || error.message.includes("rate")) {
				return NextResponse.json({ error: "AI rate limit reached. Try again in a minute." }, { status: 429 });
			}
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		
		return NextResponse.json({ error: "Failed to analyze. Please try again." }, { status: 500 });
	}
}
