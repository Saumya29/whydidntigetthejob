import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// Email list for free tier tracking + marketing
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
