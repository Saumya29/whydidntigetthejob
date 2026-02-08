"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function AnalyzeForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session_id");
	const emailParam = searchParams.get("email");

	const [resume, setResume] = useState("");
	const [jobDescription, setJobDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [roastsRemaining, setRoastsRemaining] = useState<number | null>(null);

	// Check roasts remaining on mount
	useEffect(() => {
		if (emailParam) {
			fetch("/api/user/check", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: emailParam }),
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.roastsRemaining === 0) {
						router.push(`/pricing?email=${encodeURIComponent(emailParam)}`);
					} else {
						setRoastsRemaining(data.roastsRemaining);
					}
				})
				.catch(console.error);
		} else if (!sessionId) {
			router.push("/");
		}
	}, [emailParam, sessionId, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!resume.trim() || !jobDescription.trim()) {
			setError("Please fill in both fields");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const res = await fetch("/api/analyze", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					resume,
					jobDescription,
					sessionId,
					email: emailParam,
				}),
			});

			const data = await res.json();

			if (data.id) {
				router.push(`/results/${data.id}?email=${encodeURIComponent(emailParam || "")}`);
			} else if (data.needsPayment) {
				router.push(`/pricing?email=${encodeURIComponent(emailParam || "")}`);
			} else {
				setError(data.error || "Analysis failed");
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
			<div className="w-full max-w-4xl mx-auto space-y-8">
				{/* Back link */}
				<Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm inline-block">
					← Back to home
				</Link>

				{/* Header */}
				<div className="text-center space-y-4">
					<Badge variant="outline" className="text-red-400 border-red-400/50">
						Step 2 of 2
					</Badge>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
						Time for your <span className="text-red-500">roast</span> 🔥
					</h1>
					<p className="text-xl text-zinc-400 max-w-lg mx-auto">
						Paste your resume and the job description below
					</p>
					{roastsRemaining !== null && (
						<div className="inline-flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 px-4 py-2 rounded-full">
							<span className="text-lg">🔥</span>
							<span className="text-zinc-300">
								<span className="font-bold text-white">{roastsRemaining}</span> roast{roastsRemaining !== 1 ? "s" : ""} remaining
							</span>
						</div>
					)}
				</div>

				{/* Form Container */}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
						<div className="grid md:grid-cols-2 gap-6">
							{/* Resume Input */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-lg font-semibold text-zinc-100">
										📄 Your Resume
									</label>
									<span className="text-xs text-zinc-500">
										{resume.length > 0 ? `${resume.length} chars` : "Required"}
									</span>
								</div>
								<Textarea
									value={resume}
									onChange={(e) => setResume(e.target.value)}
									placeholder="Paste your entire resume here...

John Doe
Software Engineer

EXPERIENCE
Senior Developer at TechCorp (2020-2023)
• Built scalable APIs serving 1M+ requests/day
• Led team of 5 engineers..."
									className="min-h-[280px] bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm leading-relaxed resize-none focus:border-red-500/50 focus:ring-red-500/20"
									disabled={loading}
								/>
							</div>

							{/* Job Description Input */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-lg font-semibold text-zinc-100">
										🎯 Job Description
									</label>
									<span className="text-xs text-zinc-500">
										{jobDescription.length > 0 ? `${jobDescription.length} chars` : "Required"}
									</span>
								</div>
								<Textarea
									value={jobDescription}
									onChange={(e) => setJobDescription(e.target.value)}
									placeholder="Paste the full job posting here...

Senior Software Engineer
TechCorp Inc.

We're looking for an experienced engineer to join our platform team...

Requirements:
• 7+ years of backend experience
• Expert in distributed systems..."
									className="min-h-[280px] bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm leading-relaxed resize-none focus:border-red-500/50 focus:ring-red-500/20"
									disabled={loading}
								/>
							</div>
						</div>

						{/* Error */}
						{error && (
							<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
								<p className="text-red-400 text-sm">{error}</p>
							</div>
						)}

						{/* Submit Button */}
						<Button
							type="submit"
							disabled={loading || !resume.trim() || !jobDescription.trim()}
							size="lg"
							className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-400 text-white text-lg py-7 rounded-xl transition-all"
						>
							{loading ? (
								<span className="flex items-center gap-3">
									<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
									</svg>
									Analyzing your application...
								</span>
							) : (
								"Roast Me 🔥"
							)}
						</Button>
					</div>

					{/* Tips */}
					<div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-500">
						<span>💡 Tip: Include your full resume for better analysis</span>
						<span>•</span>
						<span>📋 Copy the entire job posting, not just requirements</span>
					</div>
				</form>
			</div>
		</main>
	);
}

export default function AnalyzePage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<div className="flex items-center gap-3 text-zinc-400">
						<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
						</svg>
						Loading...
					</div>
				</div>
			}
		>
			<AnalyzeForm />
		</Suspense>
	);
}
