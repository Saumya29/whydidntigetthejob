import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { recordPayment } from "@/lib/storage";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Record the payment so the analyze endpoint can verify it
    await recordPayment(session.id);
    console.log(`Payment recorded for session: ${session.id}`);
  }

  return NextResponse.json({ received: true });
}
