import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyWebhook } from '@/lib/lemonsqueezy'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-signature') || ''
    const isValid = await verifyWebhook(body, signature)
    if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

    const event = JSON.parse(body)
    const eventName = event.meta?.event_name
    const customData = event.meta?.custom_data || {}
    const userId = customData.user_id
    const data = event.data?.attributes

    if (!userId) return NextResponse.json({ received: true })

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated': {
        const plan = customData.plan
        const status = data?.status
        if (status === 'active' || status === 'on_trial') {
          await supabaseAdmin.rpc('update_user_plan', { p_user_id: userId, p_plan: plan || 'starter' })
          await supabaseAdmin.from('profiles').update({ lemon_subscription_id: String(data?.id) }).eq('id', userId)
        }
        break
      }
      case 'subscription_cancelled':
      case 'subscription_expired': {
        await supabaseAdmin.rpc('update_user_plan', { p_user_id: userId, p_plan: 'free' })
        break
      }
      case 'order_created': {
        if (customData.type === 'topup') {
          const credits = parseInt(customData.credits || '0')
          if (credits > 0) {
            const { data: profile } = await supabaseAdmin.from('profiles').select('extra_credits').eq('id', userId).single()
            await supabaseAdmin.from('profiles').update({ extra_credits: (profile?.extra_credits || 0) + credits }).eq('id', userId)
            await supabaseAdmin.from('topup_orders').update({ status: 'completed' }).eq('user_id', userId).eq('status', 'pending')
          }
        }
        break
      }
      case 'subscription_payment_success': {
        await supabaseAdmin.from('profiles').update({ posts_used_this_month: 0 }).eq('id', userId)
        break
      }
    }
    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic' 
