import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
	try {
		// Check admin password
		const password = request.nextUrl.searchParams.get("password");
		if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const [analytics, submissions, userStats] = await Promise.all([
			convex.query(api.admin.getAnalytics),
			convex.query(api.admin.getSubmissions, { limit: 50 }),
			convex.query(api.admin.getUserStats),
		]);

		return NextResponse.json({
			analytics,
			userStats,
			submissions: submissions.map((r) => ({
				id: r._id,
				resultId: r.resultId,
				grade: r.grade,
				headline: r.headline,
				email: r.email,
				atsScore: r.atsScore?.score,
				createdAt: r.createdAt,
			})),
		});
	} catch (error) {
		console.error("Admin stats error:", error);
		return NextResponse.json(
			{
				analytics: {
					total: 0,
					today: 0,
					thisWeek: 0,
					thisMonth: 0,
					paidCount: 0,
					freeCount: 0,
					revenue: 0,
					gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
				},
				submissions: [],
			},
			{ status: 200 },
		);
	}
}
