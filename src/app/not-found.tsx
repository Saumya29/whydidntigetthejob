import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="text-center space-y-6 max-w-md">
				{/* Big 404 */}
				<div className="relative">
					<span className="text-[150px] md:text-[200px] font-black text-zinc-800 leading-none">
						404
					</span>
					<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">
						🔥
					</span>
				</div>

				{/* Message */}
				<div className="space-y-2">
					<h1 className="text-2xl md:text-3xl font-bold text-white">
						This page got rejected too
					</h1>
					<p className="text-zinc-400">
						Looks like this page didn&apos;t make the cut. Kind of like your resume.
					</p>
				</div>

				{/* CTA */}
				<div className="pt-4">
					<Link href="/">
						<Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
							Go Get Roasted Instead →
						</Button>
					</Link>
				</div>

				{/* Fun footer */}
				<p className="text-zinc-600 text-sm pt-8">
					Error code: CANDIDATE_NOT_FOUND
				</p>
			</div>
		</main>
	);
}
