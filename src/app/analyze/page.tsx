"use client";

import { useState, useCallback, useEffect } from "react";
import { useUser, useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function useSafeUser() {
	if (!isClerkConfigured) {
		return { isSignedIn: false, isLoaded: true, getToken: async () => null as string | null };
	}
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const user = useUser();
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { getToken } = useAuth();
	return { ...user, getToken };
}
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X, Link } from "lucide-react";

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
	return (
		<svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
		</svg>
	);
}

function TabBar({
	tabs,
	active,
	onChange,
}: {
	tabs: { id: string; label: string; icon: React.ReactNode }[];
	active: string;
	onChange: (id: string) => void;
}) {
	return (
		<div className="flex border-b border-border">
			{tabs.map((t) => (
				<button
					key={t.id}
					type="button"
					onClick={() => onChange(t.id)}
					className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono tracking-wide transition-colors ${
						active === t.id
							? "text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					{t.icon}
					{t.label}
					{active === t.id && (
						<span className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
					)}
				</button>
			))}
		</div>
	);
}

export default function AnalyzePage() {
	const { isLoaded, isSignedIn, getToken } = useSafeUser();

	const [resume, setResume] = useState("");
	const [jobDescription, setJobDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingStep, setLoadingStep] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [roastsRemaining, setRoastsRemaining] = useState<number | null>(null);

	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const [uploadProgress, setUploadProgress] = useState("");

	const [resumeMode, setResumeMode] = useState<"upload" | "paste">("upload");
	const [jdMode, setJdMode] = useState<"paste" | "url">("paste");
	const [jdUrl, setJdUrl] = useState("");
	const [fetchingJd, setFetchingJd] = useState(false);

	useEffect(() => {
		if (isSignedIn) {
			fetch("/api/user/check", { method: "POST" })
				.then((res) => res.json())
				.then((data) => {
					if (data.roastsRemaining !== undefined) setRoastsRemaining(data.roastsRemaining);
				})
				.catch(() => {});
		}
	}, [isSignedIn]);

	const processFile = useCallback(async (file: File) => {
		if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
			setError("Please upload a PDF file");
			return;
		}
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
			const progressTimer = setTimeout(() => setUploadProgress("Extracting text..."), 800);
			const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
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

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
		else if (e.type === "dragleave") setDragActive(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		const file = e.dataTransfer.files?.[0];
		if (file) processFile(file);
	}, [processFile]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) processFile(file);
	};

	const clearUpload = () => {
		setUploadedFile(null);
		setResume("");
	};

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
			if (data.error) setError(data.error);
			else setJobDescription(data.text);
		} catch {
			setError("Couldn't fetch that page. Try pasting the job description instead.");
		} finally {
			setFetchingJd(false);
		}
	};

	if (!isLoaded) {
		return (
			<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
				<div className="flex items-center gap-3 text-muted-foreground font-mono text-sm">
					<Spinner />
					LOADING...
				</div>
			</div>
		);
	}

	if (!isSignedIn) {
		return (
			<main className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-4">
				<div className="max-w-sm w-full bg-surface border border-border rounded p-8 text-center flex flex-col items-center gap-6">
					<div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded flex items-center justify-center">
						<span className="font-mono font-black text-xl text-primary">F</span>
					</div>
					<div className="space-y-2">
						<h1 className="text-xl font-bold text-foreground">Sign in to get roasted</h1>
						<p className="text-sm text-muted-foreground">Create a free account and get 3 credits</p>
					</div>
					{isClerkConfigured ? (
						<SignInButton mode="modal">
							<Button size="lg" className="bg-primary hover:bg-brand-dim text-primary-foreground font-mono tracking-widest text-xs w-full">
								SIGN IN TO CONTINUE
							</Button>
						</SignInButton>
					) : (
						<a href="/sign-in">
							<Button size="lg" className="bg-primary hover:bg-brand-dim text-primary-foreground font-mono tracking-widest text-xs w-full">
								SIGN IN TO CONTINUE
							</Button>
						</a>
					)}
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
		const steps = [
			{ msg: "Reading your resume...", delay: 2000 },
			{ msg: "Analyzing the job requirements...", delay: 4000 },
			{ msg: "Comparing qualifications...", delay: 7000 },
			{ msg: "Writing your roast...", delay: 11000 },
			{ msg: "Cross-referencing skills with job requirements...", delay: 18000 },
			{ msg: "Calculating your competition ranking...", delay: 25000 },
			{ msg: "Generating ATS compatibility score...", delay: 35000 },
			{ msg: "Crafting your brutally honest feedback...", delay: 45000 },
			{ msg: "Still working — thorough roasts take time...", delay: 60000 },
			{ msg: "Wrapping up the analysis...", delay: 80000 },
			{ msg: "Almost done, putting the finishing touches...", delay: 100000 },
		];
		const timers = steps.map((s) => setTimeout(() => setLoadingStep(s.msg), s.delay));
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 150000);
		try {
			// Get a fresh Clerk token to avoid expired session issues
			const token = await getToken();
			const res = await fetch("/api/analyze", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				credentials: "include",
				body: JSON.stringify({ resume, jobDescription }),
				signal: controller.signal,
			});
			if (res.status === 504) {
				setError("The analysis took too long. Please try again — it usually works on the second attempt.");
			} else {
				const contentType = res.headers.get("content-type") || "";
				if (!contentType.includes("application/json")) {
					setError("The server took too long to respond. Please try again.");
				} else {
					const data = await res.json();
					if (data.id) {
						if (data.remaining !== undefined) setRoastsRemaining(data.remaining);
						window.location.href = `/results/${data.id}`;
					} else if (res.status === 401) {
						window.location.href = "/sign-in?redirect_url=/analyze";
					} else if (data.needsPayment) {
						setRoastsRemaining(0);
						setError("No credits remaining. Contact us at saumyatiwari.29@gmail.com for more credits.");
					} else {
						setError(data.error || "Analysis failed. Please try again.");
					}
				}
			}
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				setError("The analysis is taking too long. Please try again.");
			} else {
				setError("Something went wrong. Please check your connection and try again.");
			}
		} finally {
			clearTimeout(timeout);
			for (const t of timers) clearTimeout(t);
			setLoading(false);
			setLoadingStep("");
		}
	};

	const resumeTabs = [
		{ id: "upload", label: "UPLOAD PDF", icon: <Upload className="w-3.5 h-3.5" /> },
		{ id: "paste", label: "PASTE TEXT", icon: <FileText className="w-3.5 h-3.5" /> },
	];
	const jdTabs = [
		{ id: "paste", label: "PASTE TEXT", icon: <FileText className="w-3.5 h-3.5" /> },
		{ id: "url", label: "FROM URL", icon: <Link className="w-3.5 h-3.5" /> },
	];

	return (
		<main className="px-4 py-10 md:py-14">
			<div className="w-full max-w-5xl mx-auto flex flex-col gap-8">

				{/* Page header */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<div className="h-px flex-1 bg-border" />
						<span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">Submit for roasting</span>
						<div className="h-px flex-1 bg-border" />
					</div>
					<div className="text-center space-y-2">
						<h1 className="text-4xl md:text-5xl font-black tracking-tight text-balance">
							Time for your <span className="text-primary">verdict</span>
						</h1>
						<p className="text-muted-foreground text-base">Upload your resume and paste the job description below</p>
					</div>
					{roastsRemaining !== null && (
						<div className="flex justify-center">
							<div className={`inline-flex items-center gap-2 border rounded px-4 py-2 font-mono text-xs tracking-wide ${
								roastsRemaining > 0
									? "border-border text-muted-foreground bg-surface"
									: "border-primary/30 text-primary bg-primary/10"
							}`}>
								<span className={`w-1.5 h-1.5 rounded-full ${roastsRemaining > 0 ? "bg-muted-foreground" : "bg-primary"}`} />
								<span className="text-foreground font-bold">{roastsRemaining}</span>
								{" "}CREDIT{roastsRemaining !== 1 ? "S" : ""} REMAINING
								{roastsRemaining === 0 && (
									<>
										{" "}—{" "}
										<a href="mailto:saumyatiwari.29@gmail.com" className="text-primary hover:underline">
											GET MORE
										</a>
									</>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="flex flex-col gap-6">
					<div className="grid md:grid-cols-2 gap-4">

						{/* ── Resume column ── */}
						<div className="bg-surface border border-border rounded flex flex-col overflow-hidden">
							<div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border">
								<span className="font-mono text-xs text-foreground tracking-wide font-bold">RESUME</span>
								<span className="font-mono text-[10px] text-muted-foreground">
									{resume.length > 0 ? `${resume.length} chars` : "Required"}
								</span>
							</div>
							<TabBar
								tabs={resumeTabs}
								active={resumeMode}
								onChange={(id) => {
									if (id !== resumeMode) {
										setResumeMode(id as "upload" | "paste");
										setResume("");
										setUploadedFile(null);
									}
								}}
							/>
							<div className="flex-1 p-4">
								{resumeMode === "upload" && (
									<>
										{!uploadedFile ? (
											<div
												onDragEnter={handleDrag}
												onDragLeave={handleDrag}
												onDragOver={handleDrag}
												onDrop={handleDrop}
												className={`relative border-2 border-dashed rounded flex items-center justify-center min-h-[260px] transition-all cursor-pointer ${
													dragActive
														? "border-primary bg-primary/5"
														: "border-border hover:border-muted-foreground/50 bg-background"
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
													<div className="flex flex-col items-center gap-4">
														<Spinner className="h-8 w-8 text-primary" />
														<p className="font-mono text-xs text-muted-foreground tracking-wide">{uploadProgress || "UPLOADING..."}</p>
														<div className="w-40 h-0.5 bg-surface-overlay rounded overflow-hidden">
															<div className="h-full bg-primary rounded animate-pulse" style={{ width: "70%" }} />
														</div>
													</div>
												) : (
													<div className="flex flex-col items-center gap-3 py-4">
														<div className="w-12 h-12 rounded border border-border bg-surface-raised flex items-center justify-center">
															<Upload className="w-5 h-5 text-muted-foreground" />
														</div>
														<div className="text-center">
															<p className="text-foreground text-sm font-medium">Drop your resume PDF here</p>
															<p className="font-mono text-[10px] text-muted-foreground tracking-wide mt-1">OR CLICK TO BROWSE — MAX 5MB</p>
														</div>
													</div>
												)}
											</div>
										) : (
											<div className="flex flex-col gap-3">
												<div className="flex items-center justify-between bg-surface-raised border border-border rounded px-3 py-2.5">
													<div className="flex items-center gap-2.5">
														<FileText className="w-4 h-4 text-primary flex-shrink-0" />
														<div>
															<p className="text-xs text-foreground font-medium truncate max-w-[180px]">{uploadedFile.name}</p>
															<p className="font-mono text-[10px] text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
														</div>
													</div>
													<button
														type="button"
														onClick={clearUpload}
														disabled={loading}
														className="p-1 hover:bg-surface-overlay rounded transition-colors"
													>
														<X className="w-3.5 h-3.5 text-muted-foreground" />
													</button>
												</div>
												<Textarea
													value={resume}
													readOnly
													placeholder="Extracted text from PDF..."
													className="min-h-[220px] bg-background border-border text-foreground placeholder:text-muted-foreground text-xs leading-relaxed resize-none cursor-default font-mono"
												/>
											</div>
										)}
									</>
								)}
								{resumeMode === "paste" && (
									<Textarea
										value={resume}
										onChange={(e) => setResume(e.target.value)}
										placeholder={`Paste your entire resume here...\n\nJohn Doe\nSoftware Engineer\n\nEXPERIENCE\nSenior Developer at TechCorp (2020-2023)\n• Built scalable APIs serving 1M+ requests/day\n• Led team of 5 engineers...`}
										className="min-h-[280px] bg-background border-border text-foreground placeholder:text-muted-foreground text-sm leading-relaxed resize-none focus:border-primary/50 focus:ring-primary/20"
										disabled={loading}
									/>
								)}
							</div>
						</div>

						{/* ── Job Description column ── */}
						<div className="bg-surface border border-border rounded flex flex-col overflow-hidden">
							<div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border">
								<span className="font-mono text-xs text-foreground tracking-wide font-bold">JOB DESCRIPTION</span>
								<span className="font-mono text-[10px] text-muted-foreground">
									{jobDescription.length > 0 ? `${jobDescription.length} chars` : "Required"}
								</span>
							</div>
							<TabBar
								tabs={jdTabs}
								active={jdMode}
								onChange={(id) => {
									if (id !== jdMode) {
										setJdMode(id as "paste" | "url");
										setJobDescription("");
										setJdUrl("");
									}
								}}
							/>
							<div className="flex-1 p-4">
								{jdMode === "paste" && (
									<Textarea
										value={jobDescription}
										onChange={(e) => setJobDescription(e.target.value)}
										placeholder={`Paste the full job posting here...\n\nSenior Software Engineer\nTechCorp Inc.\n\nWe're looking for an experienced engineer...\n\nRequirements:\n• 7+ years of backend experience\n• Expert in distributed systems...`}
										className="min-h-[280px] bg-background border-border text-foreground placeholder:text-muted-foreground text-sm leading-relaxed resize-none focus:border-primary/50 focus:ring-primary/20"
										disabled={loading}
									/>
								)}
								{jdMode === "url" && (
									<div className="flex flex-col gap-3">
										<div className="flex gap-2">
											<input
												type="url"
												value={jdUrl}
												onChange={(e) => setJdUrl(e.target.value)}
												placeholder="https://linkedin.com/jobs/view/..."
												className="flex-1 h-9 rounded border border-border bg-background px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none"
												disabled={fetchingJd || loading}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														if (jdUrl.trim() && !fetchingJd && !loading) fetchJobDescription();
													}
												}}
											/>
											<Button
												type="button"
												disabled={!jdUrl.trim() || fetchingJd || loading}
												onClick={fetchJobDescription}
												className="bg-primary hover:bg-brand-dim text-primary-foreground font-mono text-xs tracking-wide h-9 px-4"
											>
												{fetchingJd ? <Spinner className="h-3.5 w-3.5" /> : "FETCH"}
											</Button>
										</div>
										{jobDescription ? (
											<Textarea
												value={jobDescription}
												readOnly
												className="min-h-[230px] bg-background border-border text-foreground text-xs leading-relaxed resize-none cursor-default font-mono"
											/>
										) : (
											<div className={`min-h-[230px] flex items-center justify-center border-2 border-dashed rounded transition-colors ${fetchingJd ? "border-primary/30" : "border-border"} bg-background`}>
												{fetchingJd ? (
													<div className="flex flex-col items-center gap-3">
														<Spinner className="h-6 w-6 text-primary" />
														<p className="font-mono text-xs text-muted-foreground tracking-wide">FETCHING...</p>
													</div>
												) : (
													<div className="text-center">
														<Link className="w-7 h-7 mx-auto mb-2 text-muted-foreground/40" />
														<p className="font-mono text-xs text-muted-foreground tracking-wide">PASTE A JOB URL ABOVE</p>
														<p className="font-mono text-[10px] text-muted-foreground/60 mt-1 tracking-wide">LINKEDIN, INDEED, GREENHOUSE, ETC.</p>
													</div>
												)}
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Error */}
					{error && (
						<div className="border border-primary/30 bg-primary/10 rounded px-4 py-3">
							<p className="font-mono text-xs text-primary tracking-wide">{error}</p>
						</div>
					)}

					{/* Submit */}
					<Button
						type="submit"
						disabled={loading || uploading || !resume.trim() || !jobDescription.trim()}
						size="lg"
						className="w-full bg-primary hover:bg-brand-dim disabled:bg-surface-overlay disabled:text-muted-foreground text-primary-foreground font-mono tracking-widest text-sm h-14 red-glow transition-all"
					>
						{loading ? (
							<span className="flex items-center gap-3">
								<Spinner />
								{loadingStep || "ANALYZING YOUR APPLICATION..."}
							</span>
						) : (
							"ROAST ME"
						)}
					</Button>

					{/* Tips */}
					<div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
						<span className="font-mono text-[10px] text-muted-foreground tracking-wide">PDF upload extracts text automatically</span>
						<span className="font-mono text-[10px] text-muted-foreground tracking-wide">Paste a job posting URL or the full text</span>
					</div>
				</form>
			</div>
		</main>
	);
}
