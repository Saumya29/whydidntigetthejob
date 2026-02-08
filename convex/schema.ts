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

	results: defineTable({
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
		paymentSessionId: v.optional(v.string()),
		createdAt: v.number(),
	}).index("by_resultId", ["resultId"])
	  .index("by_createdAt", ["createdAt"]),

	payments: defineTable({
		sessionId: v.string(),
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
