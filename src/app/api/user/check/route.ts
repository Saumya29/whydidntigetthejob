import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
	try {
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

		const dbUser = await convex.mutation(api.users.getOrCreate, {
			clerkId: userId,
			email,
			name: user.fullName || undefined,
		});

		if (!dbUser) {
			return NextResponse.json(
				{ error: "Failed to get or create user" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			email: dbUser.email,
			roastsRemaining: dbUser.roastsRemaining,
			totalRoasts: dbUser.totalRoasts,
			plan: dbUser.plan,
		});
	} catch (error) {
		console.error("User check error:", error);
		return NextResponse.json(
			{ error: "Failed to check user" },
			{ status: 500 },
		);
	}
}
