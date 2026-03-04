"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function AuthNav() {
	const { isSignedIn, isLoaded } = useUser();

	if (!isLoaded) {
		return <div className="w-20 h-8 bg-secondary animate-pulse rounded" />;
	}

	if (isSignedIn) {
		return (
			<>
				<Link href="/dashboard">
					<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-secondary font-mono text-xs tracking-wide">
						DASHBOARD
					</Button>
				</Link>
				<Link href="/analyze">
					<Button size="sm" className="bg-primary hover:bg-brand-dim text-primary-foreground font-mono text-xs tracking-wide h-8 px-4">
						NEW ROAST
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
		);
	}

	return (
		<>
			<SignInButton mode="modal">
				<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-secondary font-mono text-xs tracking-wide">
					SIGN IN
				</Button>
			</SignInButton>
			<SignUpButton mode="modal">
				<Button size="sm" className="bg-primary hover:bg-brand-dim text-primary-foreground font-mono text-xs tracking-wide h-8 px-4">
					GET STARTED
				</Button>
			</SignUpButton>
		</>
	);
}

function FallbackNav() {
	return (
		<>
			<Link href="/sign-in">
				<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-secondary font-mono text-xs tracking-wide">
					SIGN IN
				</Button>
			</Link>
			<Link href="/sign-up">
				<Button size="sm" className="bg-primary hover:bg-brand-dim text-primary-foreground font-mono text-xs tracking-wide h-8 px-4">
					GET STARTED
				</Button>
			</Link>
		</>
	);
}

export function Header() {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
			<div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2.5 group">
					<span className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center flex-shrink-0">
						<span className="font-mono text-primary-foreground text-xs font-bold leading-none">F</span>
					</span>
					<span className="font-mono text-sm font-bold text-foreground tracking-tight hidden sm:inline">
						WHYDIDNT<span className="text-primary">IGETTHEJOB</span>
					</span>
				</Link>

				{/* Navigation */}
				<nav className="flex items-center gap-2">
					{isClerkConfigured ? <AuthNav /> : <FallbackNav />}
				</nav>
			</div>
		</header>
	);
}
