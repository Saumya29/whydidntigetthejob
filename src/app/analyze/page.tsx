"use client";

import { useState, useCallback, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X, Link } from "lucide-react";

export default function AnalyzePage() {
	const { isLoaded, isSignedIn, user } = useUser();

	const [resume, setResume] = useState("");
	const [jobDescription, setJobDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingStep, setLoadingStep] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [roastsRemaining, setRoastsRemaining] = useState<number | null>(null);

	// PDF upload state
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const [uploadProgress, setUploadProgress] = useState("");

	// Tab state for resume input mode
	const [resumeMode, setResumeMode] = useState<"upload" | "paste">("upload");

	// Tab state for JD input mode
	const [jdMode, setJdMode] = useState<"paste" | "url">("paste");
	const [jdUrl, setJdUrl] = useState("");
	const [fetchingJd, setFetchingJd] = useState(false);

	// Fetch credits on load
	useEffect(() => {
		if (isSignedIn) {
			fetch("/api/user/check", { method: "POST" })
				.then((res) => res.json())
				.then((data) => {
					if (data.roastsRemaining !== undefined) {
						setRoastsRemaining(data.roastsRemaining);
					}
				})
				.catch(() => {});
		}
	}, [isSignedIn]);

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
		setUploadProgress("Uploading PDF...");

		try {
			const formData = new FormData();
			formData.append("file", file);

			// Show parsing step after a short delay
			const progressTimer = setTimeout(() => setUploadProgress("Extracting text..."), 800);

			const res = await fetch("/api/parse-resume", {
				method: "POST",
				body: formData,
			});

			clearTimeout(progressTimer);
			setUploadProgress("Processing...");

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
			setUploadProgress("");
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

	// Fetch JD from URL
	const fetchJobDescription = async () => {
		setFetchingJd(true);
		setError(null);
		setJobDescription("");
		try {
			const res = await fetch("/api/fetch-jd", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: jdUrl.trim() }),
			});
			const data = await res.json();
			if (data.error) {
				setError(data.error);
			} else {
				setJobDescription(data.text);
			}
		} catch {
			setError("Couldn't fetch that page. Try pasting the job description instead.");
		} finally {
			setFetchingJd(false);
		}
	};

	// Show loading while Clerk is initializing
	if (!isLoaded) {
		return (
			<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
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
			<main className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-4">
				<div className="text-center space-y-6">
					<h1 className="text-3xl font-bold">Sign in to get roasted 🔥</h1>
					<p className="text-zinc-400">Create a free account to get 3 free credits</p>
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
		setLoadingStep("Submitting your application...");

		// Cycle through progress messages so the user knows it's working
		const steps = [
			{ msg: "Reading your resume...", delay: 2000 },
			{ msg: "Analyzing the job requirements...", delay: 4000 },
			{ msg: "Comparing qualifications...", delay: 7000 },
			{ msg: "Writing your roast...", delay: 11000 },
			{ msg: "Almost done, putting the finishing touches...", delay: 18000 },
		];
		const timers = steps.map((s) => setTimeout(() => setLoadingStep(s.msg), s.delay));

		try {
			const res = await fetch("/api/analyze", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
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
				window.location.href = `/results/${data.id}`;
			} else if (res.status === 401) {
				setError("Your session expired. Please sign in again to continue.");
			} else if (data.needsPayment) {
				setRoastsRemaining(0);
				setError("No credits remaining. Contact us at saumyatiwari.29@gmail.com for more credits.");
			} else {
				setError(data.error || "Analysis failed. Please try again.");
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			for (const t of timers) clearTimeout(t);
			setLoading(false);
			setLoadingStep("");
		}
	};

	return (
		<main className="px-4 py-8 md:py-12">
			<div className="w-full max-w-4xl mx-auto space-y-8">
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
					{roastsRemaining !== null && (
						<div className="flex flex-col items-center gap-2">
							<div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
								roastsRemaining > 0
									? "bg-zinc-800/50 border border-zinc-700"
									: "bg-red-500/20 border border-red-500/30"
							}`}>
								<span className="text-lg">🔥</span>
								<span className={roastsRemaining > 0 ? "text-zinc-300" : "text-red-400"}>
									<span className="font-bold text-white">{roastsRemaining}</span> credit{roastsRemaining !== 1 ? "s" : ""} remaining
								</span>
							</div>
							{roastsRemaining === 0 && (
								<p className="text-sm text-zinc-400">
									Need more credits? Contact{" "}
									<a href="mailto:saumyatiwari.29@gmail.com" className="text-red-400 hover:underline">
										saumyatiwari.29@gmail.com
									</a>
								</p>
							)}
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

								{/* Tabs */}
								<div className="flex border-b border-zinc-800">
									<button
										type="button"
										onClick={() => {
											if (resumeMode !== "upload") {
												setResumeMode("upload");
												setResume("");
											}
										}}
										className={`px-4 py-2 text-sm font-medium transition-colors relative ${
											resumeMode === "upload"
												? "text-red-400"
												: "text-zinc-500 hover:text-zinc-300"
										}`}
									>
										<Upload className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
										Upload PDF
										{resumeMode === "upload" && (
											<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-t" />
										)}
									</button>
									<button
										type="button"
										onClick={() => {
											if (resumeMode !== "paste") {
												setResumeMode("paste");
												setUploadedFile(null);
												setResume("");
											}
										}}
										className={`px-4 py-2 text-sm font-medium transition-colors relative ${
											resumeMode === "paste"
												? "text-red-400"
												: "text-zinc-500 hover:text-zinc-300"
										}`}
									>
										<FileText className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
										Paste Text
										{resumeMode === "paste" && (
											<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-t" />
										)}
									</button>
								</div>

								{/* Upload Tab Content */}
								{resumeMode === "upload" && (
									<>
										{!uploadedFile ? (
											<div
												onDragEnter={handleDrag}
												onDragLeave={handleDrag}
												onDragOver={handleDrag}
												onDrop={handleDrop}
												className={`relative border-2 border-dashed rounded-xl text-center transition-all cursor-pointer min-h-[280px] flex items-center justify-center ${
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
													<div className="flex flex-col items-center gap-4 py-4">
														<svg className="animate-spin h-8 w-8 text-red-500" viewBox="0 0 24 24">
															<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
															<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
														</svg>
														<p className="text-zinc-300 font-medium">{uploadProgress || "Uploading PDF..."}</p>
														<div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
															<div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: "70%" }} />
														</div>
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
										) : (
											<div className="space-y-3">
												{/* Uploaded File Badge */}
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
												{/* Extracted text preview (read-only) */}
												<Textarea
													value={resume}
													readOnly
													placeholder="Extracted text from PDF..."
													className="min-h-[230px] bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm leading-relaxed resize-none cursor-default opacity-80"
												/>
											</div>
										)}
									</>
								)}

								{/* Paste Tab Content */}
								{resumeMode === "paste" && (
									<Textarea
										value={resume}
										onChange={(e) => setResume(e.target.value)}
										placeholder={`Paste your entire resume here...

John Doe
Software Engineer

EXPERIENCE
Senior Developer at TechCorp (2020-2023)
• Built scalable APIs serving 1M+ requests/day
• Led team of 5 engineers...`}
										className="min-h-[280px] bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm leading-relaxed resize-none focus:border-red-500/50 focus:ring-red-500/20"
										disabled={loading}
									/>
								)}
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

								{/* JD Tabs */}
								<div className="flex border-b border-zinc-800">
									<button
										type="button"
										onClick={() => {
											if (jdMode !== "paste") {
												setJdMode("paste");
												setJobDescription("");
												setJdUrl("");
											}
										}}
										className={`px-4 py-2 text-sm font-medium transition-colors relative ${
											jdMode === "paste"
												? "text-red-400"
												: "text-zinc-500 hover:text-zinc-300"
										}`}
									>
										<FileText className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
										Paste Text
										{jdMode === "paste" && (
											<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-t" />
										)}
									</button>
									<button
										type="button"
										onClick={() => {
											if (jdMode !== "url") {
												setJdMode("url");
												setJobDescription("");
											}
										}}
										className={`px-4 py-2 text-sm font-medium transition-colors relative ${
											jdMode === "url"
												? "text-red-400"
												: "text-zinc-500 hover:text-zinc-300"
										}`}
									>
										<Link className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
										From URL
										{jdMode === "url" && (
											<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-t" />
										)}
									</button>
								</div>

								{/* Paste Tab Content */}
								{jdMode === "paste" && (
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
								)}

								{/* URL Tab Content */}
								{jdMode === "url" && (
									<div className="space-y-3">
										<div className="flex gap-2">
											<input
												type="url"
												value={jdUrl}
												onChange={(e) => setJdUrl(e.target.value)}
												placeholder="https://linkedin.com/jobs/view/..."
												className="flex-1 h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none"
												disabled={fetchingJd || loading}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														if (jdUrl.trim() && !fetchingJd && !loading) {
															fetchJobDescription();
														}
													}
												}}
											/>
											<Button
												type="button"
												disabled={!jdUrl.trim() || fetchingJd || loading}
												onClick={fetchJobDescription}
												className="bg-red-600 hover:bg-red-700 text-white px-4 shrink-0"
											>
												{fetchingJd ? (
													<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
														<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
														<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
													</svg>
												) : (
													"Fetch"
												)}
											</Button>
										</div>
										{jobDescription && (
											<Textarea
												value={jobDescription}
												readOnly
												placeholder="Fetched job description..."
												className="min-h-[230px] bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 text-sm leading-relaxed resize-none cursor-default opacity-80"
											/>
										)}
										{!jobDescription && !fetchingJd && (
											<div className="min-h-[230px] flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-950">
												<div className="text-center text-zinc-500 text-sm">
													<Link className="w-8 h-8 mx-auto mb-2 opacity-50" />
													<p>Paste a job posting URL above</p>
													<p className="text-xs mt-1">LinkedIn, Indeed, Greenhouse, etc.</p>
												</div>
											</div>
										)}
										{fetchingJd && (
											<div className="min-h-[230px] flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-950">
												<div className="flex flex-col items-center gap-3">
													<svg className="animate-spin h-8 w-8 text-red-500" viewBox="0 0 24 24">
														<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
														<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
													</svg>
													<p className="text-zinc-400 text-sm">Fetching job description...</p>
												</div>
											</div>
										)}
									</div>
								)}
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
									{loadingStep || "Analyzing your application..."}
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
						<span>📋 Paste a job posting URL or copy the full text</span>
					</div>
				</form>
			</div>
		</main>
	);
}
