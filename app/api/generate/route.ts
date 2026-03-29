import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, supabaseAdmin } from '@/lib/supabase'
import { generateVariations } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { topic, tone, language, length } = await req.json()
    if (!topic?.trim()) return NextResponse.json({ error: 'Topic required' }, { status: 400 })

    // Check & increment usage
    const { data: usage } = await supabaseAdmin.rpc('increment_post_usage', { p_user_id: session.user.id })
    if (!usage?.ok) {
      return NextResponse.json({ error: 'limit_reached', used: usage?.used, limit: usage?.limit, extra: usage?.extra }, { status: 402 })
    }

    // Get voice profile
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('voice_dna,voice_samples,default_tone,default_language')
      .eq('id', session.user.id).single()

    const dna = profile?.voice_dna && Object.keys(profile.voice_dna).length > 0 ? profile.voice_dna : null

    const variations = await generateVariations(
      topic,
      tone || profile?.default_tone || 'Thought Leader',
      language || profile?.default_language || 'en',
      length || 'Medium',
      dna,
      profile?.voice_samples || ''
    )

    // Save to DB
    const { data: post } = await supabaseAdmin.from('posts').insert({
      user_id: session.user.id,
      topic, tone: tone || 'Thought Leader',
      language: language || 'en',
      post_length: length || 'Medium',
      variations,
      selected_variation: 0,
      final_text: variations[0]?.text || '',
      hook_score: variations[0]?.hookScore || 80,
      readability_score: variations[0]?.readScore || 80,
      emotion_score: variations[0]?.emotScore || 80,
      cta_score: variations[0]?.ctaScore || 70,
    }).select().single()

    return NextResponse.json({ variations, postId: post?.id, usage })
  } catch (err: any) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 })
  }
}
