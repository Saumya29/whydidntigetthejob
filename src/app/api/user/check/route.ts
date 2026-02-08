import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/storage";

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{ error: "Email is required" },
				{ status: 400 }
			);
		}

		const user = await getOrCreateUser(email);

		return NextResponse.json({
			email: user.email,
			roastsRemaining: user.roastsRemaining,
			totalRoasts: user.totalRoasts,
			isPaid: user.isPaid,
		});
	} catch (error) {
		console.error("User check error:", error);
		return NextResponse.json(
			{ error: "Failed to check user" },
			{ status: 500 }
		);
	}
}
