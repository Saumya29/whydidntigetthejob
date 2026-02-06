"use client";

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
				<h1 className="text-3xl font-bold">Ready for the truth?</h1>

				<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
					<div className="text-5xl font-bold text-red-500">$7</div>
					<p className="text-zinc-400">One-time payment</p>

					<ul className="text-left space-y-2 text-sm text-zinc-300">
						<li>✓ Detailed rejection analysis</li>
						<li>✓ Skill gap breakdown</li>
						<li>✓ Roast grade (A-F)</li>
						<li>✓ Shareable results page</li>
						<li>✓ Actionable improvement tips</li>
					</ul>
				</div>

				{error && <p className="text-red-400 text-sm">{error}</p>}

				<Button
					onClick={handleCheckout}
					disabled={loading}
					size="lg"
					className="w-full bg-red-600 hover:bg-red-700 text-white"
				>
					{loading ? "Redirecting..." : "Pay with Stripe"}
				</Button>

				<p className="text-xs text-zinc-500">Secure payment powered by Stripe</p>
			</div>
		</main>
	);
}
