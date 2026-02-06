import { NextResponse } from "next/server";
import { getAllResults, getAnalytics } from "@/lib/storage";

export async function GET() {
	try {
		const analytics = await getAnalytics();
		const submissions = await getAllResults();

		return NextResponse.json({
			analytics,
			submissions: submissions.map((r) => ({
				id: r.id,
				resultId: r.id,
				grade: r.grade,
				headline: r.headline,
				isPaid: false, // Would come from payment tracking
				atsScore: r.atsScore?.score,
				createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : r.createdAt,
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
