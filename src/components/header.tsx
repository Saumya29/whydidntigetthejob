"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Header() {
	const { isSignedIn, isLoaded } = useUser();

	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
			<div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2">
					<span className="text-xl">🔥</span>
					<span className="font-bold text-white hidden sm:inline">WhyDidntIGetTheJob</span>
				</Link>

				{/* Navigation */}
				<nav className="flex items-center gap-4">
					{!isLoaded ? (
						<div className="w-20 h-8 bg-zinc-800 animate-pulse rounded" />
					) : isSignedIn ? (
						<>
							<Link href="/dashboard">
								<Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
									Dashboard
								</Button>
							</Link>
							<UserButton
								afterSignOutUrl="/"
								appearance={{
									elements: {
										avatarBox: "w-8 h-8",
									},
								}}
							/>
						</>
					) : (
						<>
							<SignInButton mode="modal">
								<Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
									Sign In
								</Button>
							</SignInButton>
							<SignUpButton mode="modal">
								<Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
									Sign Up
								</Button>
							</SignUpButton>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}
