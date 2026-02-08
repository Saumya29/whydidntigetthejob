"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

interface Submission {
	id: string;
	resultId: string;
	grade: string;
	headline: string;
	isPaid: boolean;
	isFreeRoast?: boolean;
	email?: string;
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

interface UserStats {
	total: number;
	paid: number;
	freeOnly: number;
}

export default function AdminPage() {
	const [isAuthed, setIsAuthed] = useState(false);
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

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
			<main className="min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-6">
						<div className="text-center space-y-2">
							<div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<span className="text-3xl">🔐</span>
							</div>
							<h1 className="text-2xl font-bold text-white">Admin Access</h1>
							<p className="text-zinc-400 text-sm">Enter password to continue</p>
						</div>
						<div className="space-y-4">
							<Input
								type="password"
								placeholder="Enter admin password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleLogin()}
								className="bg-zinc-950 border-zinc-700 text-zinc-100 h-12"
							/>
							{error && (
								<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
									<p className="text-red-400 text-sm text-center">{error}</p>
								</div>
							)}
							<Button onClick={handleLogin} className="w-full bg-red-600 hover:bg-red-700 h-12 text-base">
								Login
							</Button>
						</div>
					</div>
				</div>
			</main>
		);
	}

	return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
	const [analytics, setAnalytics] = useState<Analytics | null>(null);
	const [userStats, setUserStats] = useState<UserStats | null>(null);
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const res = await fetch("/api/admin/stats");
			if (res.ok) {
				const data = await res.json();
				setAnalytics(data.analytics);
				setUserStats(data.userStats);
				setSubmissions(data.submissions || []);
			} else {
				setAnalytics({
					total: 0, today: 0, thisWeek: 0, thisMonth: 0,
					paidCount: 0, freeCount: 0, revenue: 0,
					gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
				});
			}
		} catch {
			setAnalytics({
				total: 0, today: 0, thisWeek: 0, thisMonth: 0,
				paidCount: 0, freeCount: 0, revenue: 0,
				gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
			});
		} finally {
			setLoading(false);
		}
	};

	const gradeColors: Record<string, string> = {
		A: "bg-emerald-500",
		B: "bg-lime-500",
		C: "bg-yellow-500",
		D: "bg-orange-500",
		F: "bg-red-500",
	};

	if (loading) {
		return (
			<main className="min-h-screen flex items-center justify-center">
				<div className="flex items-center gap-3 text-zinc-400">
					<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
					</svg>
					Loading dashboard...
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen p-4 md:p-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h1 className="text-3xl md:text-4xl font-bold tracking-tight">
							Admin <span className="text-red-500">Dashboard</span>
						</h1>
						<p className="text-zinc-400">WhyDidntIGetTheJob Analytics</p>
					</div>
					<Button 
						variant="outline" 
						onClick={onLogout} 
						className="border-zinc-700 hover:bg-zinc-800"
					>
						Logout
					</Button>
				</div>

				{/* Key Metrics */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<MetricCard
						label="Total Roasts"
						value={analytics?.total ?? 0}
						icon="🔥"
						trend={analytics?.today ? `+${analytics.today} today` : undefined}
					/>
					<MetricCard
						label="This Week"
						value={analytics?.thisWeek ?? 0}
						icon="📈"
						accent
					/>
					<MetricCard
						label="Revenue"
						value={`$${(analytics?.revenue ?? 0).toFixed(0)}`}
						icon="💰"
						className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20"
					/>
					<MetricCard
						label="Conversion"
						value={analytics?.total ? `${Math.round((analytics.paidCount / analytics.total) * 100)}%` : "0%"}
						icon="🎯"
					/>
				</div>

				{/* User & Payment Stats */}
				<div className="grid md:grid-cols-2 gap-6">
					{/* Users */}
					<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
								<span className="text-xl">👥</span>
							</div>
							<div>
								<h3 className="font-semibold text-white">Users</h3>
								<p className="text-zinc-500 text-sm">Email signups</p>
							</div>
						</div>
						<div className="grid grid-cols-3 gap-4">
							<div className="text-center p-3 bg-zinc-800/50 rounded-xl">
								<p className="text-2xl font-bold text-white">{userStats?.total ?? 0}</p>
								<p className="text-zinc-500 text-xs">Total</p>
							</div>
							<div className="text-center p-3 bg-zinc-800/50 rounded-xl">
								<p className="text-2xl font-bold text-emerald-400">{userStats?.paid ?? 0}</p>
								<p className="text-zinc-500 text-xs">Paid</p>
							</div>
							<div className="text-center p-3 bg-zinc-800/50 rounded-xl">
								<p className="text-2xl font-bold text-zinc-400">{userStats?.freeOnly ?? 0}</p>
								<p className="text-zinc-500 text-xs">Free</p>
							</div>
						</div>
					</div>

					{/* Grade Distribution */}
					<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
								<span className="text-xl">📊</span>
							</div>
							<div>
								<h3 className="font-semibold text-white">Grade Distribution</h3>
								<p className="text-zinc-500 text-sm">How users are scoring</p>
							</div>
						</div>
						<div className="flex items-end gap-2 h-24">
							{analytics?.gradeDistribution && Object.entries(analytics.gradeDistribution).map(([grade, count]) => {
								const maxCount = Math.max(...Object.values(analytics.gradeDistribution), 1);
								const height = ((count as number) / maxCount) * 100;
								return (
									<div key={grade} className="flex-1 flex flex-col items-center gap-1">
										<div 
											className={`w-full ${gradeColors[grade]} rounded-t-lg transition-all`}
											style={{ height: `${Math.max(height, 8)}%` }}
										/>
										<span className="text-xs text-zinc-400">{grade}</span>
										<span className="text-xs text-zinc-500">{count as number}</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* Recent Submissions */}
				<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
					<div className="p-6 border-b border-zinc-800">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
								<span className="text-xl">📄</span>
							</div>
							<div>
								<h3 className="font-semibold text-white">Recent Roasts</h3>
								<p className="text-zinc-500 text-sm">Click to view full results</p>
							</div>
						</div>
					</div>
					<div className="max-h-[400px] overflow-y-auto">
						{submissions.length > 0 ? (
							<div className="divide-y divide-zinc-800">
								{submissions.map((sub) => (
									<div
										key={sub.resultId}
										className="flex items-center justify-between p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors"
										onClick={() => window.open(`/results/${sub.resultId}`, "_blank")}
									>
										<div className="flex items-center gap-4">
											<span className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${gradeColors[sub.grade.charAt(0)]}`}>
												{sub.grade}
											</span>
											<div>
												<p className="text-zinc-200 text-sm line-clamp-1 max-w-[300px]">
													{sub.headline}
												</p>
												<div className="flex items-center gap-2 mt-1">
													<p className="text-zinc-500 text-xs">
														{new Date(sub.createdAt).toLocaleDateString()}
													</p>
													{sub.email && (
														<p className="text-zinc-600 text-xs">
															• {sub.email}
														</p>
													)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{sub.atsScore !== undefined && (
												<Badge variant="outline" className="text-xs border-zinc-700">
													ATS {sub.atsScore}
												</Badge>
											)}
											{sub.isFreeRoast ? (
												<Badge className="bg-zinc-700 text-zinc-300 text-xs">
													Free
												</Badge>
											) : (
												<Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
													Paid
												</Badge>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-16">
								<div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<span className="text-3xl opacity-50">📄</span>
								</div>
								<p className="text-zinc-500">No submissions yet</p>
								<p className="text-zinc-600 text-sm mt-1">
									Roasts will appear here once users start
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Quick Actions */}
				<div className="grid md:grid-cols-3 gap-4">
					<button 
						onClick={() => window.open("/", "_blank")}
						className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-left hover:bg-zinc-800/50 transition-colors group"
					>
						<span className="text-2xl">🏠</span>
						<p className="font-medium text-white mt-2">View Landing</p>
						<p className="text-zinc-500 text-sm">Open homepage</p>
					</button>
					<button 
						onClick={() => window.open("/pricing", "_blank")}
						className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-left hover:bg-zinc-800/50 transition-colors group"
					>
						<span className="text-2xl">💳</span>
						<p className="font-medium text-white mt-2">View Pricing</p>
						<p className="text-zinc-500 text-sm">Check pricing page</p>
					</button>
					<button 
						onClick={fetchDashboardData}
						className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-left hover:bg-zinc-800/50 transition-colors group"
					>
						<span className="text-2xl">🔄</span>
						<p className="font-medium text-white mt-2">Refresh Data</p>
						<p className="text-zinc-500 text-sm">Reload stats</p>
					</button>
				</div>
			</div>
		</main>
	);
}

function MetricCard({
	label,
	value,
	icon,
	trend,
	accent,
	className,
}: {
	label: string;
	value: string | number;
	icon: string;
	trend?: string;
	accent?: boolean;
	className?: string;
}) {
	return (
		<div className={`bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 ${className || ""}`}>
			<div className="flex items-center justify-between mb-3">
				<span className="text-2xl">{icon}</span>
				{trend && (
					<Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
						{trend}
					</Badge>
				)}
				{accent && (
					<div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
				)}
			</div>
			<p className="text-3xl font-bold text-white">{value}</p>
			<p className="text-zinc-500 text-sm mt-1">{label}</p>
		</div>
	);
}
