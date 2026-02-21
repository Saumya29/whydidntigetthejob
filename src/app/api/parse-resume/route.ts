import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
	try {
		const ip = getIP(req);
		const rateLimitResult = await checkRateLimit(`parse:${ip}`);

		if (!rateLimitResult.success) {
			return NextResponse.json(
				{ error: "Too many uploads. Please wait a minute." },
				{ status: 429 },
			);
		}

		const formData = await req.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: "File too large. Maximum size is 5MB." },
				{ status: 400 },
			);
		}

		if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
			return NextResponse.json(
				{ error: "Invalid file type. Please upload a PDF file." },
				{ status: 400 },
			);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const result = await pdfParse(buffer);

		if (!result.text || result.text.trim().length === 0) {
			return NextResponse.json(
				{ error: "Could not extract text from PDF. Please try pasting your resume instead." },
				{ status: 400 },
			);
		}

		let text = result.text
			.replace(/\r\n/g, "\n")
			.replace(/\n{3,}/g, "\n\n")
			.trim();

		if (text.length > 50000) {
			text = text.slice(0, 50000) + "\n\n[Resume truncated due to length]";
		}

		return NextResponse.json({
			text,
			pages: result.numpages,
			chars: text.length,
		});
	} catch (error) {
		console.error("PDF parse error:", error);
		return NextResponse.json(
			{ error: "Failed to parse PDF. Please try pasting your resume instead." },
			{ status: 500 },
		);
	}
}
