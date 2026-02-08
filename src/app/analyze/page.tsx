"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { hasUsedFreeRoast, markFreeRoastUsed } from "@/lib/free-tier";

function AnalyzeForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session_id");
	const isFreeMode = searchParams.get("free") === "1";

	const [resume, setResume] = useState("");
	const [jobDescription, setJobDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [alreadyUsedFree, setAlreadyUsedFree] = useState(false);

	// Check if free roast already used
	useEffect(() => {
		if (isFreeMode && hasUsedFreeRoast()) {
			setAlreadyUsedFree(true);
		}
	}, [isFreeMode]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!resume.trim() || !jobDescription.trim()) {
			setError("Please fill in both fields");
			return;
		}

		// Block if trying to use free roast again
		if (isFreeMode && hasUsedFreeRoast()) {
			router.push("/checkout");
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
					isFreeRoast: isFreeMode && !hasUsedFreeRoast(),
				}),
			});

			const data = await res.json();

			if (data.id) {
				// Mark free roast as used
				if (isFreeMode) {
					markFreeRoastUsed(data.id);
				}
				router.push(`/results/${data.id}${isFreeMode ? "?free=1" : ""}`);
			} else {
				setError(data.error || "Analysis failed");
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Show paywall if already used free roast
	if (alreadyUsedFree) {
		return (
			<main className="min-h-screen p-4 py-12 flex items-center justify-center">
				<div className="max-w-md mx-auto text-center space-y-6">
					<div className="text-6xl">🔥</div>
					<h1 className="text-3xl font-bold">You've used your free roast!</h1>
					<p className="text-zinc-400">
						Want more brutal feedback? Unlock unlimited roasts for just $7.
					</p>
					<Button
						onClick={() => router.push("/checkout")}
						size="lg"
						className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6"
					>
						Get Unlimited Roasts — $7
					</Button>
					<p className="text-sm text-zinc-500">One-time payment. Roast as many applications as you want.</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen p-4 py-12">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold">Time for your roast 🔥</h1>
					<p className="text-zinc-400">Paste your resume and the job description below</p>
					{isFreeMode && (
						<p className="text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full inline-block">
							✨ Free roast — no payment required
						</p>
					)}
				</div>

				<form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
					<Card className="bg-zinc-900 border-zinc-800">
						<CardHeader>
							<CardTitle className="text-zinc-100">Your Resume</CardTitle>
							<CardDescription>Paste your entire resume text</CardDescription>
						</CardHeader>
						<CardContent>
							<Textarea
								value={resume}
								onChange={(e) => setResume(e.target.value)}
								placeholder="Paste your resume here...

Example:
John Doe
Software Engineer
5 years experience in React, Node.js...

Work Experience:
- Senior Dev at TechCorp (2020-2023)
..."
								className="min-h-[400px] bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
							/>
						</CardContent>
					</Card>

					<Card className="bg-zinc-900 border-zinc-800">
						<CardHeader>
							<CardTitle className="text-zinc-100">Job Description</CardTitle>
							<CardDescription>Paste the full job posting</CardDescription>
						</CardHeader>
						<CardContent>
							<Textarea
								value={jobDescription}
								onChange={(e) => setJobDescription(e.target.value)}
								placeholder="Paste the job description here...

Example:
Senior Software Engineer
TechCorp Inc.

We're looking for a passionate engineer...

Requirements:
- 7+ years experience
- Expert in Python, Go, Kubernetes
..."
								className="min-h-[400px] bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
							/>
						</CardContent>
					</Card>

					<div className="md:col-span-2 space-y-4">
						{error && <p className="text-red-400 text-center">{error}</p>}

						<Button
							type="submit"
							disabled={loading}
							size="lg"
							className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
						>
							{loading ? "Analyzing your failures..." : "Roast Me 🔥"}
						</Button>
					</div>
				</form>
			</div>
		</main>
	);
}

export default function AnalyzePage() {
	return (
		<Suspense
			fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
		>
			<AnalyzeForm />
		</Suspense>
	);
}
