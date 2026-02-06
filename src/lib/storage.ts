// Simple in-memory storage for MVP (replace with DB later)
// In production, use Redis, Postgres, or similar

export interface RecruiterNote {
	section: string;
	note: string;
}

export interface SkillGap {
	skill: string;
	status: "missing" | "weak" | "strong";
	jdMention: boolean;
	resumeMention: boolean;
}

export interface Priority {
	rank: number;
	issue: string;
	effort: "Low" | "Medium" | "High";
	impact: "Low" | "Medium" | "High";
	action: string;
}

export interface Competition {
	estimatedApplicants: number;
	estimatedRank: number;
	percentile: number;
	competitionLevel: "Low" | "Medium" | "High" | "Extreme";
}

export interface BulletRewrite {
	before: string;
	after: string;
	why: string;
}

export interface AnalysisResult {
	id: string;
	grade: string;
	headline: string;
	rejection: string;
	recruiterNotes: RecruiterNote[];
	skillGapHeatmap: SkillGap[];
	priorities: Priority[];
	competition: Competition;
	bulletRewrite: BulletRewrite | null;
	hiringManagerQuote: string;
	improvements: string[];
	// Legacy
	skillGaps: string[];
	createdAt: Date;
}

interface PaymentSession {
	sessionId: string;
	used: boolean;
	createdAt: Date;
}

// In-memory stores (replace with DB in production)
const results = new Map<string, AnalysisResult>();
const payments = new Map<string, PaymentSession>();

export async function saveResult(result: AnalysisResult): Promise<void> {
	results.set(result.id, result);
}

export async function getResult(id: string): Promise<AnalysisResult | null> {
	return results.get(id) || null;
}

export async function markPaymentUsed(sessionId: string): Promise<void> {
	payments.set(sessionId, { sessionId, used: true, createdAt: new Date() });
}

export async function isPaymentValid(sessionId: string | null): Promise<boolean> {
	if (!sessionId) return false;
	const payment = payments.get(sessionId);
	// For MVP, just check if we've seen this session (Stripe webhook marks it)
	// In production, verify with Stripe API
	return payment ? !payment.used : false;
}

export async function recordPayment(sessionId: string): Promise<void> {
	payments.set(sessionId, { sessionId, used: false, createdAt: new Date() });
}
