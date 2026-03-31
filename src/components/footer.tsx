import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t border-zinc-800 py-8 px-4">
			<div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center md:text-left">
				<p className="font-mono text-xs text-zinc-500">
					&copy; {new Date().getFullYear()} WhyDidntIGetTheJob
				</p>

				<nav className="flex items-center justify-center gap-6">
					<Link
						href="/privacy"
						className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2"
					>
						Privacy Policy
					</Link>
					<Link
						href="/terms"
						className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2"
					>
						Terms of Service
					</Link>
				</nav>

				<div className="flex items-center justify-center md:justify-end">
					<a
						href="https://twitter.com/whydidntigetit"
						target="_blank"
						rel="noopener noreferrer"
						className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2"
					>
						@whydidntigetit
					</a>
				</div>
			</div>
		</footer>
	);
}
