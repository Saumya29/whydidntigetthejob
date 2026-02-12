import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
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

		// Check OpenAI API key first
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
				{ needsPayment: true, error: "No roasts remaining. Please upgrade to continue." },
				{ status: 402 },
			);
		}

		const prompt = `You are a brutally honest hiring manager and recruiter who reviews job applications. A candidate applied for a job and didn't get it. Provide a COMPREHENSIVE analysis.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Provide your analysis in the following JSON format:
{
  "grade": "A+" to "F" letter grade (A+ = perfect fit, F = complete mismatch). Include + or - modifiers,
  "headline": "A one-line brutal summary (funny but true, max 100 chars)",
  "rejection": "2-3 paragraphs explaining exactly why they didn't get the job. Be specific. Be brutally honest but constructive.",
  
  "recruiterNotes": [
    { "section": "Experience", "note": "Brutally honest internal recruiter note about this section" },
    { "section": "Skills", "note": "What the recruiter actually thought" },
    { "section": "Education", "note": "Internal assessment" },
    { "section": "Overall", "note": "Final impression note" }
  ],
  
  "skillGapHeatmap": [
    { "skill": "Required skill from JD", "status": "missing" | "weak" | "strong", "jdMention": true, "resumeMention": false },
    ... (analyze 6-10 key requirements from the JD)
  ],
  
  "priorities": [
    { "rank": 1, "issue": "Most critical issue to fix", "effort": "Low" | "Medium" | "High", "impact": "Low" | "Medium" | "High", "action": "Specific action to take" },
    { "rank": 2, "issue": "Second priority", "effort": "...", "impact": "...", "action": "..." },
    { "rank": 3, "issue": "Third priority", "effort": "...", "impact": "...", "action": "..." }
  ],
  
  "competition": {
    "estimatedApplicants": number (estimate based on role type, 50-500),
    "estimatedRank": number (where this resume likely ranks),
    "percentile": number (0-100, what percentile they're in),
    "competitionLevel": "Low" | "Medium" | "High" | "Extreme"
  },
  
  "bulletRewrite": {
    "before": "Pick their weakest/most generic bullet point from the resume",
    "after": "Rewrite it to be impactful, quantified, and compelling",
    "why": "Brief explanation of what makes the new version better"
  },
  
  "atsScore": {
    "score": number (0-100, how well this resume would pass ATS systems),
    "issues": [
      { "category": "Keywords" | "Formatting" | "Sections" | "Length" | "Contact Info", "severity": "Critical" | "Warning" | "Minor", "issue": "Specific ATS issue" }
    ],
    "missingKeywords": ["Array of important keywords from JD missing in resume"],
    "tips": ["Array of 3 ATS optimization tips"]
  },
  
  "hiringManagerQuote": "What the hiring manager probably said (funny, realistic)",
  "improvements": ["Array of 4-5 specific, actionable improvement tips"]
}

Be savage but helpful. Make it entertaining AND genuinely useful.`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: "You are a brutally honest hiring expert with 20 years of recruiting experience. Respond only with valid JSON. Be specific, be funny, be helpful.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			response_format: { type: "json_object" },
			temperature: 0.85,
		});

		const content = completion.choices[0].message.content;
		if (!content) {
			throw new Error("No response from AI");
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
			isFreeRoast: true,
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
				return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
			}
			if (error.message.includes("quota") || error.message.includes("rate")) {
				return NextResponse.json({ error: "OpenAI rate limit reached. Try again in a minute." }, { status: 429 });
			}
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		
		return NextResponse.json({ error: "Failed to analyze. Please try again." }, { status: 500 });
	}
}
