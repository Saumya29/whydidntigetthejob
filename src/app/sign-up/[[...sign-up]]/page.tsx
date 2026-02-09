import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
	return (
		<main className="min-h-screen flex items-center justify-center p-4">
			<SignUp
				appearance={{
					elements: {
						rootBox: "mx-auto",
						card: "bg-zinc-900 border border-zinc-800",
					},
				}}
				routing="path"
				path="/sign-up"
				signInUrl="/sign-in"
				forceRedirectUrl="/analyze"
			/>
		</main>
	);
}
