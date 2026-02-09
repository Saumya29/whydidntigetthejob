import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Save a new result with full analysis data
export const save = mutation({
	args: {
		resultId: v.string(),
		clerkId: v.optional(v.string()),
		email: v.optional(v.string()),
		grade: v.string(),
		headline: v.string(),
		rejection: v.string(),
		hiringManagerQuote: v.string(),
		improvements: v.array(v.string()),
		skillGaps: v.array(v.string()),
		recruiterNotes: v.optional(v.array(v.object({
			section: v.string(),
			note: v.string(),
		}))),
		skillGapHeatmap: v.optional(v.array(v.object({
			skill: v.string(),
			status: v.union(v.literal("missing"), v.literal("weak"), v.literal("strong")),
			jdMention: v.boolean(),
			resumeMention: v.boolean(),
		}))),
		priorities: v.optional(v.array(v.object({
			rank: v.number(),
			issue: v.string(),
			effort: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
			impact: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
			action: v.string(),
		}))),
		competition: v.optional(v.object({
			estimatedApplicants: v.number(),
			estimatedRank: v.number(),
			percentile: v.number(),
			competitionLevel: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Extreme")),
		})),
		bulletRewrite: v.optional(v.object({
			before: v.string(),
			after: v.string(),
			why: v.string(),
		})),
		atsScore: v.optional(v.object({
			score: v.number(),
			issues: v.array(v.object({
				category: v.string(),
				issue: v.string(),
				severity: v.union(v.literal("Critical"), v.literal("Warning"), v.literal("Minor")),
			})),
			missingKeywords: v.array(v.string()),
			tips: v.array(v.string()),
		})),
		isPaid: v.optional(v.boolean()),
		isFreeRoast: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("results", {
			...args,
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

// Get user's results history
export const getByUser = query({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		const results = await ctx.db
			.query("results")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
			.order("desc")
			.take(20);
		return results;
	},
});

// Get recent results (for admin/analytics)
export const getRecent = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const results = await ctx.db
			.query("results")
			.withIndex("by_createdAt")
			.order("desc")
			.take(args.limit || 50);
		return results;
	},
});
