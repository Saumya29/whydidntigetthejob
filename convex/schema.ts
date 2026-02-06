import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	results: defineTable({
		resultId: v.string(),
		grade: v.string(),
		headline: v.string(),
		rejection: v.string(),
		skillGaps: v.array(v.string()),
		hiringManagerQuote: v.string(),
		improvements: v.array(v.string()),
		createdAt: v.number(),
	}).index("by_resultId", ["resultId"]),

	payments: defineTable({
		sessionId: v.string(),
		used: v.boolean(),
		createdAt: v.number(),
	}).index("by_sessionId", ["sessionId"]),
});
