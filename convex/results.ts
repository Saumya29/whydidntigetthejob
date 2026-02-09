import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Save a new result
export const save = mutation({
	args: {
		resultId: v.string(),
		grade: v.string(),
		headline: v.string(),
		rejection: v.string(),
		skillGaps: v.array(v.string()),
		hiringManagerQuote: v.string(),
		improvements: v.array(v.string()),
		atsScore: v.optional(v.number()),
		isPaid: v.optional(v.boolean()),
		isFreeRoast: v.optional(v.boolean()),
		email: v.optional(v.string()),
		userId: v.optional(v.string()),
		paymentSessionId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("results", {
			resultId: args.resultId,
			grade: args.grade,
			headline: args.headline,
			rejection: args.rejection,
			skillGaps: args.skillGaps,
			hiringManagerQuote: args.hiringManagerQuote,
			improvements: args.improvements,
			atsScore: args.atsScore,
			isPaid: args.isPaid,
			isFreeRoast: args.isFreeRoast,
			email: args.email,
			paymentSessionId: args.paymentSessionId,
			createdAt: Date.now(),
		});
		return id;
	},
});

// Get result by ID
export const getById = query({
	args: { resultId: v.string() },
	handler: async (ctx, args) => {
		const result = await ctx.db
			.query("results")
			.withIndex("by_resultId", (q) => q.eq("resultId", args.resultId))
			.first();
		return result;
	},
});
