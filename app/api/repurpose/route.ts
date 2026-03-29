import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, supabaseAdmin } from '@/lib/supabase'
import { repurposeContent } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { content, tone } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })
  const { data: profile } = await supabaseAdmin.from('profiles').select('voice_dna').eq('id', session.user.id).single()
  const posts = await repurposeContent(content, tone || 'Thought Leader', profile?.voice_dna)
  return NextResponse.json({ posts })
}
export const dynamic = 'force-dynamic' 
