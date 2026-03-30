import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  console.log("🔥 EVENT TYPE:", event.type)

  const supabase = createAdminClient()

  try {
    switch (event.type) {

      // ✅ FIRST TIME SUBSCRIPTION CREATE
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const user_id = session.metadata?.user_id
        const plan = session.metadata?.plan

        if (!user_id) {
          console.log("❌ Missing user_id in metadata")
          break
        }

        const stripeSub = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        const periodEnd = new Date(
          stripeSub.current_period_end * 1000
        ).toISOString()

        console.log("✅ Creating subscription for:", user_id)

        await supabase.from('subscriptions').upsert(
          {
            user_id,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan,
            status: 'active',
            current_period_end: periodEnd,
          },
          { onConflict: 'user_id' }
        )

        break
      }

      // ✅ PAYMENT SUCCESS (RENEWAL / FIRST PAYMENT CONFIRM)
      case 'invoice.payment_succeeded': {
        console.log("helloo");

        const invoice = event.data.object as Stripe.Invoice

        if (!invoice.subscription) break

        const stripeSub = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        )

        const periodEnd = new Date(
          stripeSub.current_period_end * 1000
        ).toISOString()

        console.log("✅ Updating subscription:", invoice.subscription)

        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: periodEnd,
          })
          .eq('stripe_subscription_id', invoice.subscription as string)

        break
      }

      // ❌ CANCEL
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        console.log("❌ Subscription cancelled:", sub.id)

        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', sub.id)

        break
      }
    }
  } catch (err: any) {
    console.error("❌ DB Error:", err.message)
  }

  return NextResponse.json({ received: true })
}