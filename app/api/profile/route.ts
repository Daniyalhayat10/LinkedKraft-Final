import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, supabaseAdmin } from '@/lib/supabase'
import { analyzeVoice } from '@/lib/claude'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', session.user.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ profile: data })
}

export async function PUT(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const updates: Record<string, any> = {}
  const allowed = ['full_name','role_title','default_tone','default_language','settings','voice_samples']
  for (const k of allowed) if (body[k] !== undefined) updates[k] = body[k]

  // Re-analyze voice DNA when samples updated
  if (body.voice_samples && body.voice_samples.trim().length > 80) {
    try { updates.voice_dna = await analyzeVoice(body.voice_samples) }
    catch (e) { console.error('Voice DNA error:', e) }
  }

  const { data, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', session.user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ profile: data })
}
export const dynamic = 'force-dynamic' 
