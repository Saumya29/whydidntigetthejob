import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { isPaymentValid, markPaymentUsed, saveResult } from "@/lib/storage";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
	try {
		const { resume, jobDescription, sessionId } = await request.json();

		if (!resume || !jobDescription) {
			return NextResponse.json(
				{ error: "Resume and job description are required" },
				{ status: 400 },
			);
		}

		// For MVP/testing, allow bypass if no session
		// In production, strictly validate payment
		if (process.env.NODE_ENV === "production" && sessionId) {
			const valid = await isPaymentValid(sessionId);
			if (!valid) {
				return NextResponse.json({ error: "Invalid or expired payment session" }, { status: 403 });
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
			hiringManagerQuote: analysis.hiringManagerQuote,
			improvements: analysis.improvements,
			// Legacy fields for backwards compat
			skillGaps: analysis.skillGapHeatmap?.filter((s: { status: string }) => s.status !== "strong").map((s: { skill: string }) => s.skill) || [],
			createdAt: new Date(),
		});

		// Mark payment as used
		if (sessionId) {
			await markPaymentUsed(sessionId);
		}

		return NextResponse.json({ id });
	} catch (error) {
		console.error("Analysis error:", error);
		return NextResponse.json({ error: "Failed to analyze. Please try again." }, { status: 500 });
	}
}
