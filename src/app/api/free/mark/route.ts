import { NextRequest, NextResponse } from "next/server";
import { markFreeEmailUsed } from "@/lib/storage";

export async function POST(request: NextRequest) {
	try {
		const { email, resultId } = await request.json();

		if (!email) {
			return NextResponse.json(
				{ error: "Email is required" },
				{ status: 400 }
			);
		}

		const result = await markFreeEmailUsed(email, resultId);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Free tier mark error:", error);
		return NextResponse.json(
			{ error: "Failed to mark email as used" },
			{ status: 500 }
		);
	}
}
