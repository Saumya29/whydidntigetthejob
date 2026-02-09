import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// User accounts (linked to Clerk)
	users: defineTable({
		clerkId: v.string(),
		email: v.string(),
		name: v.optional(v.string()),
		roastsRemaining: v.number(),
		totalRoasts: v.number(),
		plan: v.union(v.literal("free"), v.literal("starter"), v.literal("pro")),
		createdAt: v.number(),
		lastRoastAt: v.optional(v.number()),
	})
		.index("by_clerkId", ["clerkId"])
		.index("by_email", ["email"]),

	// Email list for free tier tracking + marketing (guest users)
	freeRoasts: defineTable({
		email: v.string(),
		usedAt: v.number(),
		resultId: v.optional(v.string()),
	}).index("by_email", ["email"]),

	// Full analysis results
	results: defineTable({
		resultId: v.string(),
		clerkId: v.optional(v.string()),
		email: v.optional(v.string()),
		
		// Core result
		grade: v.string(),
		headline: v.string(),
		rejection: v.string(),
		hiringManagerQuote: v.string(),
		improvements: v.array(v.string()),
		skillGaps: v.array(v.string()),
		
		// Recruiter notes
		recruiterNotes: v.optional(v.array(v.object({
			section: v.string(),
			note: v.string(),
		}))),
		
		// Skill gap heatmap
		skillGapHeatmap: v.optional(v.array(v.object({
			skill: v.string(),
			status: v.union(v.literal("missing"), v.literal("weak"), v.literal("strong")),
			jdMention: v.boolean(),
			resumeMention: v.boolean(),
		}))),
		
		// Priorities
		priorities: v.optional(v.array(v.object({
			rank: v.number(),
			issue: v.string(),
			effort: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
			impact: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
			action: v.string(),
		}))),
		
		// Competition analysis
		competition: v.optional(v.object({
			estimatedApplicants: v.number(),
			estimatedRank: v.number(),
			percentile: v.number(),
			competitionLevel: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Extreme")),
		})),
		
		// Bullet rewrite
		bulletRewrite: v.optional(v.object({
			before: v.string(),
			after: v.string(),
			why: v.string(),
		})),
		
		// ATS Score
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
		
		// Metadata
		isPaid: v.optional(v.boolean()),
		isFreeRoast: v.optional(v.boolean()),
		paymentSessionId: v.optional(v.string()),
		createdAt: v.number(),
	}).index("by_resultId", ["resultId"])
	  .index("by_clerkId", ["clerkId"])
	  .index("by_createdAt", ["createdAt"]),

	payments: defineTable({
		sessionId: v.string(),
		clerkId: v.optional(v.string()),
		used: v.boolean(),
		amount: v.optional(v.number()),
		createdAt: v.number(),
	}).index("by_sessionId", ["sessionId"])
	  .index("by_createdAt", ["createdAt"]),

	analytics: defineTable({
		date: v.string(), // YYYY-MM-DD
		submissions: v.number(),
		paidSubmissions: v.number(),
		revenue: v.number(),
		gradeDistribution: v.object({
			A: v.number(),
			B: v.number(),
			C: v.number(),
			D: v.number(),
			F: v.number(),
		}),
	}).index("by_date", ["date"]),
});
