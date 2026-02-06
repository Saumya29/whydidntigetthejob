"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Simple password auth - set via env or use default for demo
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

interface Submission {
	id: string;
	resultId: string;
	grade: string;
	headline: string;
	isPaid: boolean;
	atsScore?: number;
	createdAt: number;
}

interface Analytics {
	total: number;
	today: number;
	thisWeek: number;
	thisMonth: number;
	paidCount: number;
	freeCount: number;
	revenue: number;
	gradeDistribution: Record<string, number>;
}

export default function AdminPage() {
	const [isAuthed, setIsAuthed] = useState(false);
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// Check localStorage for auth on mount
	useEffect(() => {
		const stored = localStorage.getItem("wdigt_admin_auth");
		if (stored === "true") {
			setIsAuthed(true);
		}
	}, []);

	const handleLogin = () => {
		if (password === ADMIN_PASSWORD) {
			setIsAuthed(true);
			localStorage.setItem("wdigt_admin_auth", "true");
			setError("");
		} else {
			setError("Invalid password");
		}
	};

	const handleLogout = () => {
		setIsAuthed(false);
		localStorage.removeItem("wdigt_admin_auth");
	};

	if (!isAuthed) {
		return (
			<main className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
				<Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle className="text-zinc-100 text-center">🔐 Admin Access</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Input
							type="password"
							placeholder="Enter admin password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleLogin()}
							className="bg-zinc-800 border-zinc-700 text-zinc-100"
						/>
						{error && <p className="text-red-400 text-sm">{error}</p>}
						<Button onClick={handleLogin} className="w-full bg-red-600 hover:bg-red-700">
							Login
						</Button>
						<p className="text-zinc-500 text-xs text-center">
							Default password: admin123
						</p>
					</CardContent>
				</Card>
			</main>
		);
	}

	return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
	const [analytics, setAnalytics] = useState<Analytics | null>(null);
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Fetch data from API
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const res = await fetch("/api/admin/stats");
			if (res.ok) {
				const data = await res.json();
				setAnalytics(data.analytics);
				setSubmissions(data.submissions || []);
			} else {
				// Use demo data if API not available
				setAnalytics({
					total: 0,
					today: 0,
					thisWeek: 0,
					thisMonth: 0,
					paidCount: 0,
					freeCount: 0,
					revenue: 0,
					gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
				});
			}
		} catch {
			// Demo mode
			setAnalytics({
				total: 0,
				today: 0,
				thisWeek: 0,
				thisMonth: 0,
				paidCount: 0,
				freeCount: 0,
				revenue: 0,
				gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
			});
		} finally {
			setLoading(false);
		}
	};

	const gradeColors: Record<string, string> = {
		A: "bg-green-500",
		B: "bg-lime-500",
		C: "bg-yellow-500",
		D: "bg-orange-500",
		F: "bg-red-500",
	};

	if (loading) {
		return (
			<main className="min-h-screen flex items-center justify-center bg-zinc-950">
				<p className="text-zinc-400">Loading dashboard...</p>
			</main>
		);
	}

	return (
		<main className="min-h-screen p-4 md:p-8 bg-zinc-950 text-zinc-100">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold">📊 Admin Dashboard</h1>
						<p className="text-zinc-400 text-sm">WhyDidntIGetTheJob Analytics</p>
					</div>
					<Button variant="outline" onClick={onLogout} className="border-zinc-700">
						Logout
					</Button>
				</div>

				{/* Analytics Overview */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<StatCard
						title="Total Submissions"
						value={analytics?.total ?? 0}
						icon="📄"
					/>
					<StatCard
						title="Today"
						value={analytics?.today ?? 0}
						icon="📅"
						highlight
					/>
					<StatCard
						title="This Week"
						value={analytics?.thisWeek ?? 0}
						icon="📈"
					/>
					<StatCard
						title="This Month"
						value={analytics?.thisMonth ?? 0}
						icon="📊"
					/>
				</div>

				{/* Payment Stats */}
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					<StatCard
						title="Paid Submissions"
						value={analytics?.paidCount ?? 0}
						icon="💰"
						className="bg-green-500/10 border-green-500/30"
					/>
					<StatCard
						title="Free/Demo"
						value={analytics?.freeCount ?? 0}
						icon="🆓"
					/>
					<StatCard
						title="Total Revenue"
						value={`$${(analytics?.revenue ?? 0).toFixed(2)}`}
						icon="💵"
						className="bg-green-500/10 border-green-500/30"
					/>
				</div>

				{/* Grade Distribution */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle className="text-zinc-100 text-lg">📊 Grade Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-4">
							{analytics?.gradeDistribution && Object.entries(analytics.gradeDistribution).map(([grade, count]) => (
								<div key={grade} className="flex items-center gap-2">
									<span className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold ${gradeColors[grade]}`}>
										{grade}
									</span>
									<span className="text-zinc-300">{count as number}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Recent Submissions */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle className="text-zinc-100 text-lg">📄 Recent Submissions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 max-h-[400px] overflow-y-auto">
							{submissions.length > 0 ? (
								submissions.map((sub) => (
									<div
										key={sub.resultId}
										className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
										onClick={() => window.open(`/results/${sub.resultId}`, "_blank")}
									>
										<div className="flex items-center gap-3">
											<span className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm ${gradeColors[sub.grade.charAt(0)]}`}>
												{sub.grade}
											</span>
											<div>
												<p className="text-zinc-200 text-sm truncate max-w-[300px]">
													{sub.headline}
												</p>
												<p className="text-zinc-500 text-xs">
													{new Date(sub.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{sub.atsScore && (
												<Badge variant="outline" className="text-xs">
													ATS: {sub.atsScore}
												</Badge>
											)}
											{sub.isPaid && (
												<Badge className="bg-green-500/20 text-green-400 text-xs">
													Paid
												</Badge>
											)}
										</div>
									</div>
								))
							) : (
								<div className="text-center py-12">
									<p className="text-zinc-500">No submissions yet</p>
									<p className="text-zinc-600 text-sm mt-2">
										Submissions will appear here once users start using the app
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Setup Instructions */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle className="text-zinc-100 text-lg">🔧 Setup Instructions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-zinc-400">
						<p>To persist data across sessions, set up Convex:</p>
						<ol className="list-decimal list-inside space-y-2">
							<li>Run <code className="bg-zinc-800 px-2 py-0.5 rounded">npx convex dev</code></li>
							<li>Set <code className="bg-zinc-800 px-2 py-0.5 rounded">NEXT_PUBLIC_CONVEX_URL</code> in .env.local</li>
							<li>Create API route to save submissions to Convex</li>
						</ol>
						<p className="mt-4">To change admin password:</p>
						<p>Set <code className="bg-zinc-800 px-2 py-0.5 rounded">NEXT_PUBLIC_ADMIN_PASSWORD</code> in .env.local</p>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}

function StatCard({
	title,
	value,
	icon,
	highlight,
	className,
}: {
	title: string;
	value: string | number;
	icon: string;
	highlight?: boolean;
	className?: string;
}) {
	return (
		<Card className={`bg-zinc-900 border-zinc-800 ${className || ""}`}>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<span className="text-2xl">{icon}</span>
					{highlight && <Badge className="bg-green-500/20 text-green-400 text-xs">Live</Badge>}
				</div>
				<p className="text-2xl md:text-3xl font-bold mt-2">{value}</p>
				<p className="text-zinc-400 text-sm">{title}</p>
			</CardContent>
		</Card>
	);
}
