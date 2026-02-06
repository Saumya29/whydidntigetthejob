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

export interface ATSIssue {
	category: "Keywords" | "Formatting" | "Sections" | "Length" | "Contact Info";
	issue: string;
	severity: "Critical" | "Warning" | "Minor";
}

export interface ATSScore {
	score: number;
	issues: ATSIssue[];
	missingKeywords: string[];
	tips: string[];
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
	atsScore: ATSScore;
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

// Admin functions
export async function getAllResults(): Promise<AnalysisResult[]> {
	return Array.from(results.values()).sort((a, b) => {
		const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt;
		const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt;
		return timeB - timeA; // Most recent first
	});
}

export async function getAnalytics(): Promise<{
	total: number;
	today: number;
	thisWeek: number;
	thisMonth: number;
	paidCount: number;
	freeCount: number;
	revenue: number;
	gradeDistribution: Record<string, number>;
}> {
	const allResults = Array.from(results.values());
	const allPayments = Array.from(payments.values());

	const now = Date.now();
	const dayMs = 24 * 60 * 60 * 1000;
	const weekMs = 7 * dayMs;
	const monthMs = 30 * dayMs;

	const getTime = (r: AnalysisResult) =>
		r.createdAt instanceof Date ? r.createdAt.getTime() : r.createdAt;

	const today = allResults.filter((r) => getTime(r) > now - dayMs);
	const thisWeek = allResults.filter((r) => getTime(r) > now - weekMs);
	const thisMonth = allResults.filter((r) => getTime(r) > now - monthMs);

	// Grade distribution
	const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
	for (const result of allResults) {
		const baseGrade = result.grade.charAt(0).toUpperCase();
		if (baseGrade in gradeDistribution) {
			gradeDistribution[baseGrade]++;
		}
	}

	// Payment stats
	const paidCount = allPayments.filter((p) => p.used).length;
	const revenue = paidCount * 7; // $7 per paid submission

	return {
		total: allResults.length,
		today: today.length,
		thisWeek: thisWeek.length,
		thisMonth: thisMonth.length,
		paidCount,
		freeCount: allResults.length - paidCount,
		revenue,
		gradeDistribution,
	};
}
