import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
	return (
		<main className="min-h-screen flex items-center justify-center p-4">
			<SignIn
				appearance={{
					elements: {
						rootBox: "mx-auto",
						card: "bg-zinc-900 border border-zinc-800",
					},
				}}
				routing="path"
				path="/sign-in"
				signUpUrl="/sign-up"
				forceRedirectUrl="/analyze"
			/>
		</main>
	);
}
