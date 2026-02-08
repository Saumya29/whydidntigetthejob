"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FreePage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const validateEmail = (email: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!email.trim()) {
			setError("Please enter your email");
			return;
		}
		
		if (!validateEmail(email)) {
			setError("Please enter a valid email");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const res = await fetch("/api/free/check", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: email.toLowerCase().trim() }),
			});

			const data = await res.json();

			if (data.alreadyUsed) {
				// Redirect to paywall
				router.push(`/checkout?email=${encodeURIComponent(email)}&returning=1`);
			} else {
				// Allow free roast - redirect to analyze with email
				router.push(`/analyze?email=${encodeURIComponent(email)}&free=1`);
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="max-w-md mx-auto text-center space-y-8">
				{/* Back link */}
				<Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm">
					← Back to home
				</Link>

				{/* Header */}
				<div className="space-y-4">
					<Badge variant="outline" className="text-green-400 border-green-400/50">
						First roast is free
					</Badge>
					<h1 className="text-4xl font-bold">
						Get Roasted <span className="text-red-500">Free</span>
					</h1>
					<p className="text-zinc-400">
						Enter your email to unlock your free roast. No payment required.
					</p>
				</div>

				{/* Email Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
						<div className="space-y-2">
							<label htmlFor="email" className="text-sm text-zinc-400 text-left block">
								Your email
							</label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 h-12 text-lg"
								disabled={loading}
							/>
						</div>

						{error && (
							<p className="text-red-400 text-sm">{error}</p>
						)}

						<Button
							type="submit"
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
									Checking...
								</span>
							) : (
								"Get My Free Roast 🔥"
							)}
						</Button>
					</div>
				</form>

				{/* Value props */}
				<div className="space-y-3 text-left">
					<p className="text-zinc-500 text-sm text-center">What you'll get:</p>
					<ul className="space-y-2 text-sm">
						<li className="flex items-center gap-3 text-zinc-300">
							<span className="text-green-500">✓</span>
							Brutal honesty about your resume
						</li>
						<li className="flex items-center gap-3 text-zinc-300">
							<span className="text-green-500">✓</span>
							Letter grade (A-F) with explanation
						</li>
						<li className="flex items-center gap-3 text-zinc-300">
							<span className="text-green-500">✓</span>
							Specific skill gaps identified
						</li>
						<li className="flex items-center gap-3 text-zinc-300">
							<span className="text-green-500">✓</span>
							Shareable roast card
						</li>
					</ul>
				</div>

				{/* Trust */}
				<p className="text-zinc-600 text-xs">
					We'll only email you if you want more roasts. No spam, ever.
				</p>
			</div>
		</main>
	);
}
