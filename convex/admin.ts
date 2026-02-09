import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all submissions with pagination
export const getSubmissions = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit || 50;
		const results = await ctx.db
			.query("results")
			.order("desc")
			.take(limit);
		return results;
	},
});

// Get single submission by ID
export const getSubmissionById = query({
	args: {
		resultId: v.string(),
	},
	handler: async (ctx, args) => {
		const result = await ctx.db
			.query("results")
			.withIndex("by_resultId", (q) => q.eq("resultId", args.resultId))
			.first();
		return result;
	},
});

// Get analytics overview
export const getAnalytics = query({
	handler: async (ctx) => {
		const now = Date.now();
		const dayMs = 24 * 60 * 60 * 1000;
		const weekMs = 7 * dayMs;
		const monthMs = 30 * dayMs;

		// Get all results
		const allResults = await ctx.db.query("results").collect();
		
		// Calculate time-based stats
		const today = allResults.filter(r => r.createdAt > now - dayMs);
		const thisWeek = allResults.filter(r => r.createdAt > now - weekMs);
		const thisMonth = allResults.filter(r => r.createdAt > now - monthMs);

		// Grade distribution
		const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
		for (const result of allResults) {
			const baseGrade = result.grade.charAt(0).toUpperCase();
			if (baseGrade in gradeDistribution) {
				gradeDistribution[baseGrade]++;
			}
		}

		// Payment stats
		const paidResults = allResults.filter(r => r.isPaid);
		const payments = await ctx.db.query("payments").collect();
		const revenue = payments.filter(p => p.used && p.amount).reduce((sum, p) => sum + (p.amount || 0), 0);

		// Calculate average ATS score (atsScore is now an object with .score)
		const resultsWithAts = allResults.filter(r => r.atsScore?.score !== undefined);
		const avgAtsScore = resultsWithAts.length > 0
			? resultsWithAts.reduce((sum, r) => sum + (r.atsScore?.score || 0), 0) / resultsWithAts.length
			: 0;

		return {
			total: allResults.length,
			today: today.length,
			thisWeek: thisWeek.length,
			thisMonth: thisMonth.length,
			paidCount: paidResults.length,
			freeCount: allResults.length - paidResults.length,
			revenue: revenue / 100, // Convert cents to dollars
			gradeDistribution,
			averageAtsScore: avgAtsScore,
		};
	},
});

// Get recent submissions for dashboard
export const getRecentSubmissions = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit || 10;
		const results = await ctx.db
			.query("results")
			.order("desc")
			.take(limit);
		
		return results.map(r => ({
			id: r._id,
			resultId: r.resultId,
			grade: r.grade,
			headline: r.headline,
			isPaid: r.isPaid || false,
			atsScore: r.atsScore?.score || null,
			createdAt: r.createdAt,
		}));
	},
});

// Get common issues (skill gaps)
export const getCommonIssues = query({
	handler: async (ctx) => {
		const results = await ctx.db.query("results").collect();
		
		const issueCounts: Record<string, number> = {};
		for (const result of results) {
			for (const gap of result.skillGaps || []) {
				issueCounts[gap] = (issueCounts[gap] || 0) + 1;
			}
		}

		// Sort by count and return top 10
		const sorted = Object.entries(issueCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([issue, count]) => ({ issue, count }));

		return sorted;
	},
});
