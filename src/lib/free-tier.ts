// Free tier management via localStorage
const FREE_ROAST_KEY = "wdigtj_free_roast_used";
const FREE_ROAST_ID_KEY = "wdigtj_free_roast_id";

export function hasUsedFreeRoast(): boolean {
	if (typeof window === "undefined") return false;
	return localStorage.getItem(FREE_ROAST_KEY) === "true";
}

export function markFreeRoastUsed(roastId: string): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(FREE_ROAST_KEY, "true");
	localStorage.setItem(FREE_ROAST_ID_KEY, roastId);
}

export function getFreeRoastId(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(FREE_ROAST_ID_KEY);
}

// For testing/admin: reset free tier
export function resetFreeRoast(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem(FREE_ROAST_KEY);
	localStorage.removeItem(FREE_ROAST_ID_KEY);
}
