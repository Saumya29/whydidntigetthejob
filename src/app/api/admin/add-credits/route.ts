import { type NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
	const { email, count, password } = await request.json();

	if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!email || !count || count < 1) {
		return NextResponse.json({ error: "Email and count required" }, { status: 400 });
	}

	const result = await convex.mutation(api.users.addRoastsByEmail, {
		email,
		count: Number(count),
	});

	if (!result.success) {
		return NextResponse.json({ error: result.error }, { status: 404 });
	}

	return NextResponse.json({ success: true, remaining: result.remaining });
}
