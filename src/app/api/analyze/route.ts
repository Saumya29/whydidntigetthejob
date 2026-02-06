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

		const prompt = `You are a brutally honest hiring manager who reviews job applications. A candidate applied for a job and didn't get it. Analyze why.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Provide your analysis in the following JSON format:
{
  "grade": "A" to "F" (A = you were actually qualified, F = complete mismatch),
  "headline": "A one-line brutal summary (funny but true)",
  "rejection": "2-3 paragraphs explaining exactly why they didn't get the job. Be specific about what's missing. Be brutally honest but constructive.",
  "skillGaps": ["Array of 3-5 specific skills or qualifications they're missing"],
  "hiringManagerQuote": "What the hiring manager probably said after reviewing this resume (funny, realistic)",
  "improvements": ["Array of 4-5 specific, actionable things they should do to get this type of job"]
}

Be savage but helpful. The goal is to help them understand what they need to work on. Make it entertaining but genuinely useful.`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: "You are a brutally honest hiring expert. Respond only with valid JSON.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			response_format: { type: "json_object" },
			temperature: 0.8,
		});

		const content = completion.choices[0].message.content;
		if (!content) {
			throw new Error("No response from AI");
		}

		const analysis = JSON.parse(content);
		const id = nanoid(10);

		// Save result
		await saveResult({
			id,
			grade: analysis.grade,
			headline: analysis.headline,
			rejection: analysis.rejection,
			skillGaps: analysis.skillGaps,
			hiringManagerQuote: analysis.hiringManagerQuote,
			improvements: analysis.improvements,
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
