import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
	const { userId } = await auth();
	const user = await currentUser();

	if (!userId) {
		redirect("/sign-in");
	}

	// TODO: Fetch user's roast history and remaining roasts from Convex
	const roastsRemaining: number = 3; // Placeholder
	const roastHistory: { id: string; grade: string; headline: string; createdAt: string }[] = []; // Placeholder

	return (
		<main className="min-h-screen p-4 md:p-8">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h1 className="text-3xl font-bold">
							Welcome back, <span className="text-red-500">{user?.firstName || "friend"}</span>
						</h1>
						<p className="text-zinc-400">Your roast dashboard</p>
					</div>
					<Link href="/">
						<Button variant="outline" className="border-zinc-700">
							← Back to Home
						</Button>
					</Link>
				</div>

				{/* Stats */}
				<div className="grid md:grid-cols-3 gap-4">
					<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
						<div className="flex items-center gap-3 mb-3">
							<span className="text-2xl">🔥</span>
							<span className="text-zinc-400">Roasts Remaining</span>
						</div>
						<p className="text-4xl font-bold text-white">{roastsRemaining}</p>
						{roastsRemaining === 0 && (
							<Link href="/pricing" className="text-red-400 text-sm hover:underline mt-2 inline-block">
								Get more roasts →
							</Link>
						)}
					</div>

					<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
						<div className="flex items-center gap-3 mb-3">
							<span className="text-2xl">📊</span>
							<span className="text-zinc-400">Total Roasts</span>
						</div>
						<p className="text-4xl font-bold text-white">{roastHistory.length}</p>
					</div>

					<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
						<div className="flex items-center gap-3 mb-3">
							<span className="text-2xl">⭐</span>
							<span className="text-zinc-400">Plan</span>
						</div>
						<Badge className="bg-zinc-700 text-zinc-200 text-lg px-3 py-1">Free</Badge>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
					<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
					<div className="flex flex-wrap gap-3">
						<Link href="/analyze">
							<Button className="bg-red-600 hover:bg-red-700">
								🔥 New Roast
							</Button>
						</Link>
						<Link href="/pricing">
							<Button variant="outline" className="border-zinc-700">
								💳 Get More Roasts
							</Button>
						</Link>
					</div>
				</div>

				{/* Roast History */}
				<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
					<div className="p-6 border-b border-zinc-800">
						<h2 className="text-xl font-semibold">Roast History</h2>
					</div>
					{roastHistory.length > 0 ? (
						<div className="divide-y divide-zinc-800">
							{roastHistory.map((roast) => (
								<Link
									key={roast.id}
									href={`/results/${roast.id}`}
									className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
								>
									<div className="flex items-center gap-4">
										<span className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 font-bold flex items-center justify-center">
											{roast.grade}
										</span>
										<div>
											<p className="text-zinc-200">{roast.headline}</p>
											<p className="text-zinc-500 text-sm">{roast.createdAt}</p>
										</div>
									</div>
									<span className="text-zinc-500">→</span>
								</Link>
							))}
						</div>
					) : (
						<div className="p-12 text-center">
							<span className="text-6xl mb-4 block">📄</span>
							<p className="text-zinc-400 mb-2">No roasts yet</p>
							<p className="text-zinc-500 text-sm mb-4">Get your first resume roasted!</p>
							<Link href="/analyze">
								<Button className="bg-red-600 hover:bg-red-700">
									Get Roasted 🔥
								</Button>
							</Link>
						</div>
					)}
				</div>

				{/* Account Info */}
				<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
					<h2 className="text-xl font-semibold mb-4">Account</h2>
					<div className="space-y-3 text-sm">
						<div className="flex justify-between">
							<span className="text-zinc-400">Email</span>
							<span className="text-zinc-200">{user?.emailAddresses[0]?.emailAddress}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-zinc-400">Member since</span>
							<span className="text-zinc-200">
								{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Today"}
							</span>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
