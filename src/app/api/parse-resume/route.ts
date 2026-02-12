import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
	try {
		// Rate limiting (more lenient for PDF parsing - 20/min)
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

		// Check file size
		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: "File too large. Maximum size is 5MB." },
				{ status: 400 }
			);
		}

		// Check file type
		const validTypes = [
			"application/pdf",
			"application/x-pdf",
		];
		
		if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
			return NextResponse.json(
				{ error: "Invalid file type. Please upload a PDF file." },
				{ status: 400 }
			);
		}

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Parse PDF using v2 API
		const parser = new PDFParse({ data: buffer });
		const result = await parser.getText();

		if (!result.text || result.text.trim().length === 0) {
			return NextResponse.json(
				{ error: "Could not extract text from PDF. Please try pasting your resume instead." },
				{ status: 400 }
			);
		}

		// Clean up the text
		let text = result.text
			.replace(/\r\n/g, "\n")
			.replace(/\n{3,}/g, "\n\n")
			.trim();

		// Truncate if too long (keep first 50k chars)
		if (text.length > 50000) {
			text = text.slice(0, 50000) + "\n\n[Resume truncated due to length]";
		}

		return NextResponse.json({
			text,
			pages: result.pages?.length ?? 1,
			chars: text.length,
		});
	} catch (error) {
		console.error("PDF parse error:", error);
		return NextResponse.json(
			{ error: "Failed to parse PDF. Please try pasting your resume instead." },
			{ status: 500 }
		);
	}
}
