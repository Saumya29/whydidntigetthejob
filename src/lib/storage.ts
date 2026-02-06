// Simple in-memory storage for MVP (replace with DB later)
// In production, use Redis, Postgres, or similar

interface AnalysisResult {
	id: string;
	grade: string;
	headline: string;
	rejection: string;
	skillGaps: string[];
	hiringManagerQuote: string;
	improvements: string[];
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
