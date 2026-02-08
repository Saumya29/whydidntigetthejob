"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PLANS = [
	{
		id: "starter",
		name: "Starter Pack",
		roasts: 10,
		price: 5,
		pricePerRoast: "0.50",
		popular: false,
	},
	{
		id: "pro",
		name: "Pro Pack",
		roasts: 50,
		price: 15,
		pricePerRoast: "0.30",
		popular: true,
		savings: "40% off",
	},
];

function PricingContent() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email");
	const [loading, setLoading] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handlePurchase = async (planId: string) => {
		if (!email) {
			setError("Please start from the home page");
			return;
		}

		setLoading(planId);
		setError(null);

		try {
			const res = await fetch("/api/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ 
					email,
					planId,
				}),
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
			setLoading(null);
		}
	};

	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="max-w-3xl mx-auto text-center space-y-8">
				{/* Back link */}
				<Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm">
					← Back to home
				</Link>

				{/* Header */}
				<div className="space-y-4">
					<div className="inline-block bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-4">
						<p className="text-red-400 text-sm">
							🔥 You've used all 3 free roasts!
						</p>
					</div>
					<h1 className="text-4xl font-bold">Get More Roasts</h1>
					<p className="text-zinc-400 max-w-md mx-auto">
						One-time purchase. No subscriptions. Use your roasts anytime.
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid md:grid-cols-2 gap-6 mt-8">
					{PLANS.map((plan) => (
						<div
							key={plan.id}
							className={`relative bg-zinc-900 border rounded-2xl p-6 text-left ${
								plan.popular 
									? "border-red-500/50 ring-1 ring-red-500/20" 
									: "border-zinc-800"
							}`}
						>
							{plan.popular && (
								<Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white">
									Best Value
								</Badge>
							)}

							<div className="space-y-4">
								<div>
									<h3 className="text-xl font-bold text-white">{plan.name}</h3>
									<p className="text-zinc-500 text-sm">{plan.roasts} roasts</p>
								</div>

								<div className="flex items-baseline gap-1">
									<span className="text-4xl font-bold text-white">${plan.price}</span>
									{plan.savings && (
										<span className="text-green-400 text-sm ml-2">{plan.savings}</span>
									)}
								</div>

								<p className="text-zinc-500 text-sm">
									${plan.pricePerRoast} per roast
								</p>

								<Button
									onClick={() => handlePurchase(plan.id)}
									disabled={loading !== null}
									className={`w-full ${
										plan.popular 
											? "bg-red-600 hover:bg-red-700" 
											: "bg-zinc-800 hover:bg-zinc-700"
									} text-white`}
								>
									{loading === plan.id ? (
										<span className="flex items-center gap-2">
											<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
											</svg>
											Processing...
										</span>
									) : (
										`Get ${plan.roasts} Roasts`
									)}
								</Button>
							</div>
						</div>
					))}
				</div>

				{error && (
					<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
						<p className="text-red-400 text-sm">{error}</p>
					</div>
				)}

				{/* Features */}
				<div className="pt-8 border-t border-zinc-800">
					<p className="text-zinc-500 text-sm mb-4">Every roast includes:</p>
					<div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-400">
						<span>✓ Brutal honesty</span>
						<span>✓ Skill gap analysis</span>
						<span>✓ Letter grade</span>
						<span>✓ Shareable card</span>
						<span>✓ ATS tips</span>
					</div>
				</div>

				{/* Trust */}
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
			</div>
		</main>
	);
}

export default function PricingPage() {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
			<PricingContent />
		</Suspense>
	);
}
