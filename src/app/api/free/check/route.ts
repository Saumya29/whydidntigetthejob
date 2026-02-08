import { NextRequest, NextResponse } from "next/server";
import { checkFreeEmail } from "@/lib/storage";

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{ error: "Email is required" },
				{ status: 400 }
			);
		}

		const result = await checkFreeEmail(email);

		return NextResponse.json({
			alreadyUsed: result.exists,
			usedAt: result.usedAt,
			resultId: result.resultId,
		});
	} catch (error) {
		console.error("Free tier check error:", error);
		return NextResponse.json(
			{ error: "Failed to check email" },
			{ status: 500 }
		);
	}
}
