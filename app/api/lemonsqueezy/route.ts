import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, supabaseAdmin } from '@/lib/supabase'
import { createCheckout, PLANS, TOPUP_PACKS } from '@/lib/lemonsqueezy'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type, plan, billing, credits } = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', session.user.id)
      .single()

    const email = profile?.email || session.user.email!
    const name = profile?.full_name || ''

    // TOP-UP (one-time payment)
    if (type === 'topup') {
      const pack = TOPUP_PACKS.find(p => p.credits === credits)
      if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })

      // Save pending order
      await supabaseAdmin.from('topup_orders').insert({
        user_id: session.user.id,
        credits_added: credits,
        amount_cents: pack.price * 100,
        status: 'pending',
      })

      const url = await createCheckout({
        variantId: pack.variantId,
        email,
        name,
        customData: {
          user_id: session.user.id,
          type: 'topup',
          credits: String(credits),
        },
        redirectUrl: `${appUrl}/dashboard?topup=success&credits=${credits}`,
      })

      return NextResponse.json({ url })
    }

    // SUBSCRIPTION
    const planKey = `${plan}_${billing || 'monthly'}` as keyof typeof PLANS
    const planData = PLANS[planKey]
    if (!planData) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const url = await createCheckout({
      variantId: planData.variantId,
      email,
      name,
      customData: {
        user_id: session.user.id,
        plan: plan,
        type: 'subscription',
      },
      redirectUrl: `${appUrl}/dashboard?upgrade=success`,
    })

    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Customer portal - LemonSqueezy doesn't have a portal API
// so we redirect to their subscription management page
export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get customer's subscription URL from LemonSqueezy
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('lemon_subscription_id')
    .eq('id', session.user.id)
    .single()

  // Return LemonSqueezy customer portal
  const url = `https://app.lemonsqueezy.com/my-orders`
  return NextResponse.json({ url })
}
export const dynamic = 'force-dynamic' 
