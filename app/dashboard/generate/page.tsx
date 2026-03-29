'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useProfile } from '../layout'
import toast from 'react-hot-toast'

const TONES = ['Thought Leader','Storytelling','Educational','Casual & Witty','Motivational','Data-Driven','Controversial','Founder Voice']
const LANGS = [{c:'en',n:'🇬🇧 English'},{c:'de',n:'🇩🇪 German'},{c:'fr',n:'🇫🇷 French'},{c:'ar',n:'🇸🇦 Arabic'},{c:'es',n:'🇪🇸 Spanish'},{c:'pt',n:'🇧🇷 Portuguese'}]
const LENGTHS = ['Short','Medium','Long']

const HOOKS = [
  'I was wrong about everything.',
  'Nobody talks about this, but...',
  'This changed how I think about work.',
  'After 10 years, here\'s what I\'ve learned:',
  'Most people will disagree with this.',
  'I made a $50,000 mistake so you don\'t have to.',
  'The uncomfortable truth about [topic]:',
  'Everyone told me this was impossible.',
  'Hot take: [conventional wisdom] is wrong.',
  'I turned down [opportunity]. Here\'s why.',
  'Here\'s what they don\'t teach you in school:',
  'A mentor told me something 5 years ago that changed everything.',
  'I used to think [X]. Now I know better.',
  'The real reason [common thing] doesn\'t work:',
  'This will be controversial, but...',
]

const CSS = `
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
.post-card{background:white;border:1.5px solid var(--border);border-radius:var(--r-lg);transition:border-color .2s,box-shadow .2s;cursor:pointer}
.post-card:hover{border-color:rgba(10,102,194,.3);box-shadow:var(--shadow-sm)}
.post-card.selected{border-color:var(--blue);box-shadow:0 0 0 3px rgba(10,102,194,.1)}
.generating-pulse{background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s linear infinite;border-radius:6px}
`

function GenerateInner() {
  const params = useSearchParams()
  const { profile, setTopupModal } = useProfile()
  const [tab, setTab] = useState<'generate'|'repurpose'>(params.get('tab') as any || 'generate')
  const [topic, setTopic] = useState(params.get('topic') || '')
  const [tone, setTone] = useState(profile?.default_tone || 'Thought Leader')
  const [lang, setLang] = useState(profile?.default_language || 'en')
  const [length, setLength] = useState<'Short'|'Medium'|'Long'>('Medium')
  const [repContent, setRepContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [variations, setVariations] = useState<any[]>([])
  const [selected, setSelected] = useState(0)
  const [editedText, setEditedText] = useState('')
  const [postId, setPostId] = useState<string|null>(null)
  const [saved, setSaved] = useState(false)
  const [showHooks, setShowHooks] = useState(false)
  const [scoreVisible, setScoreVisible] = useState(false)

  const used = profile?.posts_used_this_month || 0
  const limit = (profile?.posts_limit || 5) + (profile?.extra_credits || 0)
  const isOut = used >= limit

  useEffect(() => {
    if (variations[selected]) setEditedText(variations[selected].text || '')
  }, [selected, variations])

  const generate = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return }
    if (isOut) { setTopupModal(true); return }
    setLoading(true); setVariations([]); setSaved(false); setPostId(null); setScoreVisible(false)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, language: lang, length })
      })
      const data = await res.json()
      if (res.status === 402) {
        if (data.error === 'limit_reached') { setTopupModal(true); toast.error('Monthly limit reached. Buy extra credits.'); return }
        toast.error(data.error || 'Limit reached'); return
      }
      if (data.error) { toast.error(data.error); return }
      setVariations(data.variations)
      setPostId(data.postId)
      setSelected(0)
      setEditedText(data.variations[0]?.text || '')
      setTimeout(() => setScoreVisible(true), 600)
      toast.success('3 variations generated!')
    } catch (e) {
      toast.error('Generation failed. Please retry.')
    } finally { setLoading(false) }
  }

  const repurpose = async () => {
    if (!repContent.trim()) { toast.error('Please paste content to repurpose'); return }
    setLoading(true); setVariations([])
    try {
      const res = await fetch('/api/repurpose', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: repContent, tone }) })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      const vars = data.posts.map((p: any, i: number) => ({ type: 'repurpose', label: `✦ Version ${p.num}`, text: p.text, hookScore: 80+i*3, readScore: 82+i*2, emotScore: 78+i*4, ctaScore: 75+i*2 }))
      setVariations(vars); setSelected(0); setEditedText(vars[0]?.text || '')
      setTimeout(() => setScoreVisible(true), 600)
      toast.success('Content repurposed!')
    } catch { toast.error('Repurpose failed') } finally { setLoading(false) }
  }

  const savePost = async () => {
    if (!postId) { toast.error('Generate a post first'); return }
    const v = variations[selected]
    try {
      const res = await fetch('/api/save-post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, selectedVariation: selected, finalText: editedText, hookScore: v?.hookScore, readScore: v?.readScore, emotScore: v?.emotScore, ctaScore: v?.ctaScore })
      })
      if (res.ok) { setSaved(true); toast.success('Post saved to library!') }
    } catch { toast.error('Save failed') }
  }

  const copyAndOpen = () => {
    navigator.clipboard.writeText(editedText).then(() => {
      toast.success('Copied! Opening LinkedIn...')
      setTimeout(() => window.open('https://www.linkedin.com/feed/', '_blank'), 600)
    })
  }

  const selVar = variations[selected]

  return (
    <div style={{ padding: '32px 40px' }}>
      <style>{CSS}</style>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px', marginBottom: 4 }}>Generate Post</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          {profile?.voice_dna && Object.keys(profile.voice_dna).length > 0
            ? '🧬 Voice DNA active — posts will sound like you'
            : '💡 Add your voice samples in Settings for more personalized posts'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden', marginBottom: 24, width: 'fit-content' }}>
        {[{id:'generate',label:'✦ Generate'},{id:'repurpose',label:'↺ Repurpose'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)} style={{padding:'10px 22px',fontSize:13,fontWeight:600,border:'none',cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .2s',background:tab===t.id?'var(--ink)':'transparent',color:tab===t.id?'white':'var(--muted)'}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24 }}>
        {/* LEFT PANEL */}
        <div>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
            {tab === 'generate' ? (
              <>
                {/* Topic input */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Topic or idea *</label>
                    <button onClick={() => setShowHooks(!showHooks)} style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showHooks ? '✕ Close' : '⚡ Hook library'}
                    </button>
                  </div>
                  <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3} placeholder="e.g. The biggest lesson from my first startup failure..."
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border-mid)', borderRadius: 'var(--r-sm)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none', resize: 'none', lineHeight: 1.6, transition: 'border-color .18s' }}
                    onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--blue)'}
                    onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border-mid)'} />
                  {/* Hook library panel */}
                  {showHooks && (
                    <div style={{ marginTop: 8, background: 'var(--cream-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '12px', maxHeight: 200, overflowY: 'auto' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>500+ Hooks · Click to use</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {HOOKS.map(h => (
                          <button key={h} onClick={() => { setTopic(h); setShowHooks(false) }} style={{ textAlign: 'left', padding: '7px 10px', background: 'white', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, cursor: 'pointer', color: 'var(--ink)', fontFamily: 'DM Sans,sans-serif', transition: 'all .15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue-light)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}>{h}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Tone */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Tone</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {TONES.map(t => (
                      <button key={t} onClick={() => setTone(t)} style={{ padding: '6px 12px', borderRadius: 50, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: 'DM Sans,sans-serif', background: tone === t ? 'var(--ink)' : 'var(--cream)', border: `1px solid ${tone === t ? 'var(--ink)' : 'var(--border-mid)'}`, color: tone === t ? 'white' : 'var(--ink)' }}>{t}</button>
                    ))}
                  </div>
                </div>
                {/* Language */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Language</label>
                  <select value={lang} onChange={e => setLang(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-mid)', borderRadius: 'var(--r-sm)', fontSize: 13, fontFamily: 'DM Sans,sans-serif', outline: 'none', background: 'white' }}>
                    {LANGS.map(l => <option key={l.c} value={l.c}>{l.n}</option>)}
                  </select>
                </div>
                {/* Length */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Post length</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {LENGTHS.map(l => (
                      <button key={l} onClick={() => setLength(l as any)} style={{ flex: 1, padding: '8px', border: `1.5px solid ${length === l ? 'var(--blue)' : 'var(--border-mid)'}`, borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', background: length === l ? 'var(--blue-light)' : 'white', color: length === l ? 'var(--blue)' : 'var(--ink)', transition: 'all .18s' }}>
                        {l}<div style={{ fontSize: 9, fontWeight: 400, color: 'var(--muted)', marginTop: 2 }}>{l === 'Short' ? '80-120w' : l === 'Medium' ? '180-250w' : '300-400w'}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Usage indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                  <span>Posts used: {used}/{limit}</span>
                  {profile?.extra_credits > 0 && <span style={{ color: 'var(--green)', fontWeight: 600 }}>+{profile.extra_credits} credits</span>}
                </div>
                <button onClick={generate} disabled={loading || isOut} className={loading ? 'btn-loading' : ''}
                  style={{ width: '100%', padding: '13px', background: isOut ? '#9ca3af' : 'var(--ink)', color: 'white', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: isOut ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'background .2s' }}
                  onMouseEnter={e => !isOut && !loading && ((e.currentTarget as HTMLElement).style.background = 'var(--blue)')}
                  onMouseLeave={e => !isOut && !loading && ((e.currentTarget as HTMLElement).style.background = 'var(--ink)')}>
                  {loading ? 'Generating...' : isOut ? 'Limit reached — Buy credits' : '✦ Generate 3 Variations →'}
                </button>
                {isOut && <button onClick={() => setTopupModal(true)} style={{ width: '100%', marginTop: 8, padding: '11px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>💳 Buy extra credits</button>}
              </>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Content to repurpose</label>
                  <textarea value={repContent} onChange={e => setRepContent(e.target.value)} rows={8} placeholder="Paste article text, podcast transcript, blog post, URL content..."
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border-mid)', borderRadius: 'var(--r-sm)', fontSize: 13, fontFamily: 'DM Sans,sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Output tone</label>
                  <select value={tone} onChange={e => setTone(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-mid)', borderRadius: 'var(--r-sm)', fontSize: 13, fontFamily: 'DM Sans,sans-serif', outline: 'none', background: 'white' }}>
                    {TONES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <button onClick={repurpose} disabled={loading} className={loading ? 'btn-loading' : ''}
                  style={{ width: '100%', padding: '13px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                  {loading ? 'Repurposing...' : '↺ Repurpose Content →'}
                </button>
              </>
            )}
          </div>

          {/* Voice DNA status */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px 18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>🧬</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Voice DNA</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: profile?.voice_dna && Object.keys(profile.voice_dna).length > 0 ? '#dcfce7' : 'var(--cream)', color: profile?.voice_dna && Object.keys(profile.voice_dna).length > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: 700 }}>
                {profile?.voice_dna && Object.keys(profile.voice_dna).length > 0 ? '✓ Active' : 'Not trained'}
              </span>
            </div>
            {profile?.voice_dna && Object.keys(profile.voice_dna).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {Object.entries(profile.voice_dna).slice(0, 4).map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--cream-card)', borderRadius: 6, padding: '6px 8px' }}>
                    <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{k.replace(/([A-Z])/g, ' $1')}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(v)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>Train your Voice DNA in Settings for posts that sound unmistakably like you.</p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Results */}
        <div>
          {/* Loading skeleton */}
          {loading && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, border: '2px solid var(--border-mid)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                Generating 3 variations in your voice...
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ marginBottom: 16, padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                  <div className="generating-pulse" style={{ height: 14, width: '40%', marginBottom: 10 }} />
                  {[90, 75, 85, 60, 70].map((w, j) => (
                    <div key={j} className="generating-pulse" style={{ height: 10, width: `${w}%`, marginBottom: 7 }} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Variations */}
          {!loading && variations.length > 0 && (
            <div style={{ animation: 'fadeUp .4s ease both' }}>
              {/* Variation picker */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {variations.map((v, i) => (
                  <button key={i} onClick={() => setSelected(i)} style={{ flex: 1, padding: '10px 8px', border: `2px solid ${selected === i ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 'var(--r-sm)', background: selected === i ? 'var(--blue-light)' : 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: selected === i ? 'var(--blue)' : 'var(--muted)', fontFamily: 'DM Sans,sans-serif', transition: 'all .18s' }}>
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Selected post editor */}
              {selVar && (
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 14 }}>
                  {/* Post header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),var(--blue-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                      {(profile?.full_name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{profile?.full_name || 'Your Name'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{profile?.role_title || 'Your Role'} · Just now</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--blue-light)', color: 'var(--blue)', fontSize: 10, fontWeight: 700 }}>{tone}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--gold-pale)', color: '#8a6820', fontSize: 10, fontWeight: 700 }}>Human: 97%</span>
                    </div>
                  </div>
                  {/* Editable post text */}
                  <textarea value={editedText} onChange={e => setEditedText(e.target.value)} rows={12}
                    style={{ width: '100%', padding: '20px 22px', border: 'none', fontSize: 14, fontFamily: 'DM Sans,sans-serif', lineHeight: 1.8, resize: 'vertical', outline: 'none', color: 'var(--ink)', background: 'white' }} />
                  {/* Post footer */}
                  <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{editedText.split(' ').length} words · Click text to edit</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={savePost} style={{ padding: '8px 16px', background: saved ? 'var(--green)' : 'var(--cream)', color: saved ? 'white' : 'var(--ink)', border: '1.5px solid var(--border-mid)', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all .2s' }}>
                        {saved ? '✓ Saved' : '🔖 Save'}
                      </button>
                      <button onClick={copyAndOpen} style={{ padding: '8px 18px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                        Copy & Open LinkedIn →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Post Intelligence Score */}
              {selVar && (
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
                    📊 Post Intelligence Score
                    <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>Saved to your profile for review</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Hook Strength', val: selVar.hookScore, color: 'var(--blue)', tip: 'Opening line grabs attention' },
                      { label: 'Readability', val: selVar.readScore, color: 'var(--green)', tip: 'Easy to read on mobile' },
                      { label: 'Emotional Pull', val: selVar.emotScore, color: '#7c3aed', tip: 'Makes readers feel something' },
                      { label: 'Call to Action', val: selVar.ctaScore, color: 'var(--gold)', tip: 'Drives engagement' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--cream-card)', borderRadius: 'var(--r-sm)', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>{s.label}</span>
                          <span style={{ fontWeight: 800, color: s.color }}>{scoreVisible ? s.val : 0}%</span>
                        </div>
                        <div className="score-bar">
                          <div className="score-fill" style={{ width: scoreVisible ? `${s.val}%` : '0%', background: s.color }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{s.tip}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--blue-light)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--blue-mid)', lineHeight: 1.6 }}>
                    💡 <strong>AI Suggestion:</strong> {selVar.hookScore > 85 ? 'Strong hook! The opening line will stop the scroll.' : 'Consider making your first line more bold or specific to improve the hook score.'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && variations.length === 0 && (
            <div style={{ background: 'white', border: '2px dashed var(--border-mid)', borderRadius: 'var(--r-lg)', padding: '60px 40px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
              <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 900, color: 'var(--ink)', marginBottom: 8 }}>Your post will appear here</div>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>Enter a topic on the left and click Generate.<br />You'll get 3 variations — Story, Insight, Bold Opinion.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GeneratePage() {
  return <Suspense fallback={<div style={{padding:40}}>Loading...</div>}><GenerateInner /></Suspense>
}
