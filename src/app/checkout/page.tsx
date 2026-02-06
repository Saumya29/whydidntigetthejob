"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCheckout = async () => {
		setLoading(true);
		setError(null);

		try {
			const res = await fetch("/api/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			const data = await res.json();

			if (data.url) {
				window.location.href = data.url;
			} else {
				setError("Failed to create checkout session");
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="max-w-md mx-auto text-center space-y-6">
				{/* Back link */}
				<Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm">
					← Back to home
				</Link>

				<h1 className="text-3xl font-bold">Ready for the truth?</h1>
				<p className="text-zinc-400">One payment. Lifetime of clarity.</p>

				<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
					<div className="flex items-baseline justify-center gap-1">
						<span className="text-5xl font-bold text-white">$7</span>
						<span className="text-zinc-500">USD</span>
					</div>
					<p className="text-zinc-500 text-sm">One-time payment • No subscription</p>

					<div className="border-t border-zinc-800 pt-4">
						<ul className="text-left space-y-3 text-sm">
							<li className="flex items-center gap-3 text-zinc-300">
								<span className="text-green-500">✓</span>
								Brutal honesty about your resume
							</li>
							<li className="flex items-center gap-3 text-zinc-300">
								<span className="text-green-500">✓</span>
								Specific skill gaps identified
							</li>
							<li className="flex items-center gap-3 text-zinc-300">
								<span className="text-green-500">✓</span>
								Letter grade (A-F) with explanation
							</li>
							<li className="flex items-center gap-3 text-zinc-300">
								<span className="text-green-500">✓</span>
								Shareable roast card for social
							</li>
							<li className="flex items-center gap-3 text-zinc-300">
								<span className="text-green-500">✓</span>
								Actionable tips to improve
							</li>
						</ul>
					</div>
				</div>

				{error && (
					<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
						<p className="text-red-400 text-sm">{error}</p>
					</div>
				)}

				<Button
					onClick={handleCheckout}
					disabled={loading}
					size="lg"
					className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
				>
					{loading ? (
						<span className="flex items-center gap-2">
							<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							Processing...
						</span>
					) : (
						"Get Roasted — $7"
					)}
				</Button>

				<div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
					<span className="flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						Secure payment
					</span>
					<span>•</span>
					<span>Powered by Stripe</span>
				</div>

				{/* Trust badges */}
				<div className="pt-4 border-t border-zinc-800">
					<p className="text-zinc-600 text-xs">
						100% satisfaction guarantee. If you don&apos;t learn something, we&apos;ll pretend we never roasted you.
					</p>
				</div>
			</div>
		</main>
	);
}
