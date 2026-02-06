import { NextResponse } from "next/server";
import Stripe from "stripe";

// Demo mode: bypass Stripe if no valid key
const DEMO_MODE = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder");

export async function POST() {
	const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

	// Demo mode - skip Stripe, go straight to analyze
	if (DEMO_MODE) {
		const demoSessionId = `demo_${Date.now()}`;
		return NextResponse.json({ 
			url: `${baseUrl}/analyze?session_id=${demoSessionId}`,
			demo: true 
		});
	}

	try {
		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
		
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							name: "Resume Roast",
							description: "Get brutally honest AI feedback on why you didn't get the job",
						},
						unit_amount: 700, // $7.00
					},
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: `${baseUrl}/analyze?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}/checkout`,
		});

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("Stripe error:", error);
		// Fallback to demo mode on error
		const demoSessionId = `demo_${Date.now()}`;
		return NextResponse.json({ 
			url: `${baseUrl}/analyze?session_id=${demoSessionId}`,
			demo: true,
			fallback: true
		});
	}
}
