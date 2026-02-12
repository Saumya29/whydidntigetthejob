"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X } from "lucide-react";

export default function AnalyzePage() {
	const router = useRouter();
	const { isLoaded, isSignedIn, user } = useUser();

	const [resume, setResume] = useState("");
	const [jobDescription, setJobDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [roastsRemaining, setRoastsRemaining] = useState<number | null>(null);
	
	// PDF upload state
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [dragActive, setDragActive] = useState(false);

	// Handle file upload
	const processFile = useCallback(async (file: File) => {
		// Validate file type
		if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
			setError("Please upload a PDF file");
			return;
		}

		// Validate file size (5MB)
		if (file.size > 5 * 1024 * 1024) {
			setError("File too large. Maximum size is 5MB.");
			return;
		}

		setUploading(true);
		setError(null);
		setUploadedFile(file);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const res = await fetch("/api/parse-resume", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();

			if (data.error) {
				setError(data.error);
				setUploadedFile(null);
			} else {
				setResume(data.text);
			}
		} catch {
			setError("Failed to parse PDF. Please try pasting your resume instead.");
			setUploadedFile(null);
		} finally {
			setUploading(false);
		}
	}, []);

	// Handle drag events
	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		const file = e.dataTransfer.files?.[0];
		if (file) {
			processFile(file);
		}
	}, [processFile]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			processFile(file);
		}
	};

	const clearUpload = () => {
		setUploadedFile(null);
		setResume("");
	};

	// Show loading while Clerk is initializing
	if (!isLoaded) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex items-center gap-3 text-zinc-400">
					<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
					</svg>
					Loading...
				</div>
			</div>
		);
	}

	// Show sign-in prompt if not authenticated
	if (!isSignedIn) {
		return (
			<main className="min-h-screen flex flex-col items-center justify-center p-4">
				<div className="text-center space-y-6">
					<h1 className="text-3xl font-bold">Sign in to get roasted 🔥</h1>
					<p className="text-zinc-400">Create a free account to get 3 free resume roasts</p>
					<SignInButton mode="modal">
						<Button size="lg" className="bg-red-600 hover:bg-red-700">
							Sign In to Continue
						</Button>
					</SignInButton>
				</div>
			</main>
		);
	}

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
				}),
			});

			const data = await res.json();

			if (data.id) {
				if (data.remaining !== undefined) {
					setRoastsRemaining(data.remaining);
				}
				router.push(`/results/${data.id}`);
			} else if (data.needsPayment) {
				setRoastsRemaining(0);
				router.push("/pricing");
			} else {
				setError(data.error || "Analysis failed. Please try again.");
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
						Ready to roast
					</Badge>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
						Time for your <span className="text-red-500">roast</span> 🔥
					</h1>
					<p className="text-xl text-zinc-400 max-w-lg mx-auto">
						Upload your resume PDF or paste it below
					</p>
					{user?.primaryEmailAddress && (
						<div className="flex items-center justify-center gap-3 text-sm text-zinc-500">
							<span>Signed in as {user.primaryEmailAddress.emailAddress}</span>
							<SignOutButton>
								<button type="button" className="text-red-400 hover:text-red-300 underline underline-offset-2">
									Logout
								</button>
							</SignOutButton>
						</div>
					)}
					{roastsRemaining !== null && (
						<div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
							roastsRemaining > 0 
								? "bg-zinc-800/50 border border-zinc-700" 
								: "bg-red-500/20 border border-red-500/30"
						}`}>
							<span className="text-lg">🔥</span>
							<span className={roastsRemaining > 0 ? "text-zinc-300" : "text-red-400"}>
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
								
								{/* PDF Upload Zone */}
								{!uploadedFile && !resume && (
									<div
										onDragEnter={handleDrag}
										onDragLeave={handleDrag}
										onDragOver={handleDrag}
										onDrop={handleDrop}
										className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
											dragActive
												? "border-red-500 bg-red-500/10"
												: "border-zinc-700 hover:border-zinc-600 bg-zinc-950"
										}`}
									>
										<input
											type="file"
											accept=".pdf,application/pdf"
											onChange={handleFileSelect}
											className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
											disabled={uploading || loading}
										/>
										{uploading ? (
											<div className="flex flex-col items-center gap-3 py-4">
												<svg className="animate-spin h-8 w-8 text-red-500" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
												</svg>
												<p className="text-zinc-400">Parsing PDF...</p>
											</div>
										) : (
											<div className="flex flex-col items-center gap-3 py-4">
												<div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
													<Upload className="w-6 h-6 text-zinc-400" />
												</div>
												<div>
													<p className="text-zinc-300 font-medium">
														Drop your resume PDF here
													</p>
													<p className="text-zinc-500 text-sm mt-1">
														or click to browse (max 5MB)
													</p>
												</div>
											</div>
										)}
									</div>
								)}

								{/* Uploaded File Badge */}
								{uploadedFile && (
									<div className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
										<div className="flex items-center gap-3">
											<FileText className="w-5 h-5 text-red-400" />
											<div>
												<p className="text-sm text-zinc-200 font-medium truncate max-w-[200px]">
													{uploadedFile.name}
												</p>
												<p className="text-xs text-zinc-500">
													{(uploadedFile.size / 1024).toFixed(1)} KB
												</p>
											</div>
										</div>
										<button
											type="button"
											onClick={clearUpload}
											className="p-1 hover:bg-zinc-700 rounded-full transition-colors"
											disabled={loading}
										>
											<X className="w-4 h-4 text-zinc-400" />
										</button>
									</div>
								)}

								{/* Or divider */}
								{!uploadedFile && !resume && (
									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-zinc-800" />
										</div>
										<div className="relative flex justify-center text-xs">
											<span className="bg-zinc-900 px-2 text-zinc-500">or paste below</span>
										</div>
									</div>
								)}

								{/* Textarea */}
								<Textarea
									value={resume}
									onChange={(e) => {
										setResume(e.target.value);
										if (e.target.value && uploadedFile) {
											setUploadedFile(null);
										}
									}}
									placeholder={uploadedFile ? "Extracted text from PDF..." : `Paste your entire resume here...

John Doe
Software Engineer

EXPERIENCE
Senior Developer at TechCorp (2020-2023)
• Built scalable APIs serving 1M+ requests/day
• Led team of 5 engineers...`}
									className={`bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm leading-relaxed resize-none focus:border-red-500/50 focus:ring-red-500/20 ${
										uploadedFile || resume ? "min-h-[200px]" : "min-h-[120px]"
									}`}
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
									placeholder={`Paste the full job posting here...

Senior Software Engineer
TechCorp Inc.

We're looking for an experienced engineer to join our platform team...

Requirements:
• 7+ years of backend experience
• Expert in distributed systems...`}
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
							disabled={loading || uploading || !resume.trim() || !jobDescription.trim()}
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
						<span>💡 Tip: PDF upload extracts text automatically</span>
						<span>•</span>
						<span>📋 Copy the entire job posting, not just requirements</span>
					</div>
				</form>
			</div>
		</main>
	);
}
