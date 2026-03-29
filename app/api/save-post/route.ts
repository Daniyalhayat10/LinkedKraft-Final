import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { postId, selectedVariation, finalText, hookScore, readScore, emotScore, ctaScore } = body
  const { data, error } = await supabaseAdmin.from('posts')
    .update({ is_saved: true, selected_variation: selectedVariation, final_text: finalText,
      hook_score: hookScore, readability_score: readScore, emotion_score: emotScore, cta_score: ctaScore })
    .eq('id', postId).eq('user_id', session.user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ post: data })
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const tone = searchParams.get('tone')
  let q = supabaseAdmin.from('posts').select('*')
    .eq('user_id', session.user.id).eq('is_saved', true)
    .order('created_at', { ascending: false }).limit(100)
  if (tone && tone !== 'all') q = q.eq('tone', tone)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ posts: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { postId } = await req.json()
  const { error } = await supabaseAdmin.from('posts').delete().eq('id', postId).eq('user_id', session.user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
export const dynamic = 'force-dynamic' 
