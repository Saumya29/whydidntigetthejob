import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isPaymentValid, markPaymentUsed, saveResult, useRoast } from "@/lib/storage";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
	try {
		// Check OpenAI API key first
		if (!process.env.OPENAI_API_KEY) {
			return NextResponse.json(
				{ error: "OpenAI API key not configured. Add OPENAI_API_KEY to environment variables." },
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

		const { resume, jobDescription, sessionId } = await request.json();

		if (!resume || !jobDescription) {
			return NextResponse.json(
				{ error: "Resume and job description are required" },
				{ status: 400 },
			);
		}

		// Check roast credits
		let roastResult = null;
		if (sessionId) {
			// Paid session validation
			const valid = await isPaymentValid(sessionId);
			if (!valid && process.env.NODE_ENV === "production") {
				return NextResponse.json({ error: "Invalid or expired payment session" }, { status: 403 });
			}
		} else {
			// Use free roast credits
			roastResult = await useRoast(email);
			if (!roastResult.success) {
				return NextResponse.json({ 
					error: "No roasts remaining", 
					needsPayment: true,
					remaining: 0 
				}, { status: 402 });
			}
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
      { "category": "Keywords" | "Formatting" | "Sections" | "Length" | "Contact Info", "issue": "Specific ATS issue", "severity": "Critical" | "Warning" | "Minor" }
    ],
    "missingKeywords": ["Array of important keywords from JD missing in resume"],
    "tips": ["Array of 3 ATS optimization tips"]
  },
  
  "hiringManagerQuote": "What the hiring manager probably said (funny, realistic)",
  "improvements": ["Array of 4-5 specific, actionable improvement tips"]
}

Be savage but helpful. Make it entertaining AND genuinely useful. The candidate paid $7 for this - give them their money's worth.`;

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
		const id = nanoid(10);

		// Save result with all new fields
		await saveResult({
			id,
			grade: analysis.grade,
			headline: analysis.headline,
			rejection: analysis.rejection,
			recruiterNotes: analysis.recruiterNotes || [],
			skillGapHeatmap: analysis.skillGapHeatmap || [],
			priorities: analysis.priorities || [],
			competition: analysis.competition || { estimatedApplicants: 150, estimatedRank: 75, percentile: 50, competitionLevel: "Medium" },
			bulletRewrite: analysis.bulletRewrite || null,
			atsScore: analysis.atsScore || { score: 50, issues: [], missingKeywords: [], tips: [] },
			hiringManagerQuote: analysis.hiringManagerQuote,
			improvements: analysis.improvements,
			// Legacy fields for backwards compat
			skillGaps: analysis.skillGapHeatmap?.filter((s: { status: string }) => s.status !== "strong").map((s: { skill: string }) => s.skill) || [],
			createdAt: new Date(),
			isFreeRoast: !sessionId,
			email: email,
			userId: userId,
		});

		// Mark payment as used
		if (sessionId) {
			await markPaymentUsed(sessionId);
		}

		// Return full result so client can store it
		return NextResponse.json({ 
			id,
			remaining: roastResult?.remaining ?? null,
			result: {
				id,
				grade: analysis.grade,
				headline: analysis.headline,
				rejection: analysis.rejection,
				recruiterNotes: analysis.recruiterNotes || [],
				skillGapHeatmap: analysis.skillGapHeatmap || [],
				priorities: analysis.priorities || [],
				competition: analysis.competition || { estimatedApplicants: 150, estimatedRank: 75, percentile: 50, competitionLevel: "Medium" },
				bulletRewrite: analysis.bulletRewrite || null,
				atsScore: analysis.atsScore || { score: 50, issues: [], missingKeywords: [], tips: [] },
				hiringManagerQuote: analysis.hiringManagerQuote,
				improvements: analysis.improvements,
				skillGaps: analysis.skillGapHeatmap?.filter((s: { status: string }) => s.status !== "strong").map((s: { skill: string }) => s.skill) || [],
			}
		});
	} catch (error) {
		console.error("Analysis error:", error);
		
		// Return specific error messages for debugging
		if (error instanceof Error) {
			// OpenAI errors
			if (error.message.includes("API key")) {
				return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
			}
			if (error.message.includes("quota") || error.message.includes("rate")) {
				return NextResponse.json({ error: "OpenAI rate limit reached. Try again in a minute." }, { status: 429 });
			}
			// Return actual error in development
			if (process.env.NODE_ENV !== "production") {
				return NextResponse.json({ error: error.message }, { status: 500 });
			}
		}
		
		return NextResponse.json({ error: "Failed to analyze. Please try again." }, { status: 500 });
	}
}
