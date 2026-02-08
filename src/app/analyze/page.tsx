"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
			// No email and no paid session - redirect to home
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
		<main className="min-h-screen p-4 py-12">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold">Time for your roast 🔥</h1>
					<p className="text-zinc-400">Paste your resume and the job description below</p>
					{roastsRemaining !== null && (
						<p className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full inline-block">
							🔥 {roastsRemaining} roast{roastsRemaining !== 1 ? "s" : ""} remaining
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
