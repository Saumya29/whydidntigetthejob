import { NextResponse } from "next/server";
import { convert } from "html-to-text";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

const MAX_TEXT_LENGTH = 50_000;

export async function POST(request: Request) {
	const ip = getIP(request);
	const { success } = await checkRateLimit(`fetch-jd:${ip}`);
	if (!success) {
		return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
	}

	let url: string;
	try {
		const body = await request.json();
		url = body.url;
	} catch {
		return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
	}

	if (!url || typeof url !== "string") {
		return NextResponse.json({ error: "URL is required" }, { status: 400 });
	}

	// Validate URL format
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
	}

	if (!["http:", "https:"].includes(parsed.protocol)) {
		return NextResponse.json({ error: "Only HTTP/HTTPS URLs are supported" }, { status: 400 });
	}

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10_000);

		const res = await fetch(url, {
			signal: controller.signal,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (compatible; WhyDidntIGetTheJob/1.0; +https://whydidntigetthejob.com)",
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			},
			redirect: "follow",
		});

		clearTimeout(timeout);

		if (!res.ok) {
			return NextResponse.json(
				{ error: `Couldn't fetch that page (status ${res.status}). Try pasting the job description instead.` },
				{ status: 422 },
			);
		}

		const contentType = res.headers.get("content-type") || "";
		if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
			return NextResponse.json(
				{ error: "That URL doesn't appear to be an HTML page. Try pasting the job description instead." },
				{ status: 422 },
			);
		}

		const html = await res.text();

		// Strip noisy elements before converting
		const cleaned = html
			.replace(/<script[\s\S]*?<\/script>/gi, "")
			.replace(/<style[\s\S]*?<\/style>/gi, "")
			.replace(/<nav[\s\S]*?<\/nav>/gi, "")
			.replace(/<footer[\s\S]*?<\/footer>/gi, "")
			.replace(/<header[\s\S]*?<\/header>/gi, "")
			.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

		let text = convert(cleaned, {
			wordwrap: false,
			selectors: [
				{ selector: "img", format: "skip" },
				{ selector: "a", options: { ignoreHref: true } },
			],
		});

		// Collapse excessive whitespace
		text = text.replace(/\n{3,}/g, "\n\n").trim();

		if (text.length > MAX_TEXT_LENGTH) {
			text = text.slice(0, MAX_TEXT_LENGTH);
		}

		if (text.length < 50) {
			return NextResponse.json(
				{ error: "Couldn't extract meaningful text from that page. Try pasting the job description instead." },
				{ status: 422 },
			);
		}

		return NextResponse.json({ text });
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") {
			return NextResponse.json(
				{ error: "Request timed out. The site took too long to respond. Try pasting the job description instead." },
				{ status: 422 },
			);
		}
		return NextResponse.json(
			{ error: "Couldn't fetch that page. Try pasting the job description instead." },
			{ status: 422 },
		);
	}
}
