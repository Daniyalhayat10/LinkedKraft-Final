import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, supabaseAdmin } from '@/lib/supabase'
import { generateReplies } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { comment, context } = await req.json()
  if (!comment?.trim()) return NextResponse.json({ error: 'Comment required' }, { status: 400 })
  const { data: profile } = await supabaseAdmin.from('profiles').select('voice_dna,plan').eq('id', session.user.id).single()
  if (profile?.plan === 'free') return NextResponse.json({ error: 'Upgrade required' }, { status: 402 })
  const replies = await generateReplies(comment, context || '', profile?.voice_dna)
  await supabaseAdmin.from('comment_replies').insert({ user_id: session.user.id, original_comment: comment, post_context: context, replies })
  return NextResponse.json({ replies })
}
export const dynamic = 'force-dynamic' 
