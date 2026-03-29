'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const STEPS = ['Welcome','Your Role','Train Voice DNA','You\'re ready!']
const TONES = ['Thought Leader','Storytelling','Educational','Casual & Witty','Motivational','Data-Driven','Controversial','Founder Voice']
const LANGS = [
  {code:'en',name:'English',flag:'🇬🇧'},{code:'de',name:'German',flag:'🇩🇪'},
  {code:'fr',name:'French',flag:'🇫🇷'},{code:'ar',name:'Arabic',flag:'🇸🇦'},
  {code:'es',name:'Spanish',flag:'🇪🇸'},{code:'pt',name:'Portuguese',flag:'🇧🇷'},
]

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes orbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
.scale-in{animation:scaleIn .4s ease both}
`

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [tone, setTone] = useState('Thought Leader')
  const [lang, setLang] = useState('en')
  const [samples, setSamples] = useState('')
  const [dna, setDna] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/')
      if (user?.user_metadata?.full_name) setName(user.user_metadata.full_name)
    })
  }, [])

  const analyzeVoice = async () => {
    if (samples.trim().length < 80) { toast.error('Please paste at least 80 characters'); return }
    setAnalyzing(true)
    try {
      const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voice_samples: samples, full_name: name, role_title: role, default_tone: tone, default_language: lang }) })
      const data = await res.json()
      if (data.profile?.voice_dna) setDna(data.profile.voice_dna)
      toast.success('Voice DNA analyzed!')
      setStep(3)
    } catch (e) { toast.error('Analysis failed, please retry') }
    finally { setAnalyzing(false) }
  }

  const skipVoice = async () => {
    setSaving(true)
    await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ full_name: name, role_title: role, default_tone: tone, default_language: lang }) })
    setSaving(false)
    router.push('/dashboard')
  }

  const finish = async () => {
    setSaving(true)
    await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ full_name: name, role_title: role, default_tone: tone, default_language: lang }) })
    setSaving(false)
    toast.success('Profile saved!')
    router.push('/dashboard/generate')
  }

  const progress = (step / (STEPS.length - 1)) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{CSS}</style>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 900 }}>Linked<span style={{ color: 'var(--blue)' }}>Kraft</span></div>
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i <= step ? 'var(--blue)' : 'white', border: `2px solid ${i <= step ? 'var(--blue)' : 'var(--border-mid)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i <= step ? 'white' : 'var(--muted)' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: i === step ? 'var(--ink)' : 'var(--muted-light)' }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 3, background: 'var(--border-mid)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--blue)', borderRadius: 2, width: `${progress}%`, transition: 'width .4s ease' }} />
          </div>
        </div>

        <div key={step} className="scale-in" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '40px', boxShadow: 'var(--shadow-lg)' }}>
          {step === 0 && (
            <div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>👋</div>
              <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Welcome to LinkedKraft</h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.7 }}>Let&apos;s set up your profile in under 2 minutes.</p>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Your name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Mitchell" style={iStyle} />
              </div>
              <button onClick={() => { if (!name.trim()) { toast.error('Please enter your name'); return } setStep(1) }} style={btnStyle}>Continue →</button>
            </div>
          )}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>🎯</div>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Tell us about your work</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.7 }}>This helps us generate content that fits your audience.</p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Your role / title</label>
                <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Founder & CEO, Marketing Lead..." style={iStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Preferred tone</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)} style={{ padding: '7px 14px', borderRadius: 50, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', background: tone === t ? 'var(--ink)' : 'var(--cream)', border: `1px solid ${tone === t ? 'var(--ink)' : 'var(--border-mid)'}`, color: tone === t ? 'white' : 'var(--ink)' }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Primary language</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {LANGS.map(l => (
                    <button key={l.code} onClick={() => setLang(l.code)} style={{ padding: '10px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', background: lang === l.code ? 'var(--blue-light)' : 'var(--cream)', border: `1.5px solid ${lang === l.code ? 'var(--blue)' : 'var(--border)'}`, color: lang === l.code ? 'var(--blue)' : 'var(--ink)', textAlign: 'center' }}>
                      <div>{l.flag}</div><div style={{ fontSize: 11 }}>{l.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(0)} style={btnOutlineStyle}>← Back</button>
                <button onClick={() => setStep(2)} style={{ ...btnStyle, flex: 1 }}>Continue →</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>🧬</div>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Train your Voice DNA</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.7 }}>Paste 2-3 of your best LinkedIn posts. Our AI extracts your writing fingerprint.</p>
              <div style={{ marginBottom: 20 }}>
                <textarea value={samples} onChange={e => setSamples(e.target.value)} rows={8} placeholder="Paste 2-3 of your real LinkedIn posts here..." style={{ ...iStyle, resize: 'vertical', fontFamily: 'DM Sans,sans-serif', lineHeight: 1.6 }} />
              </div>
              <button onClick={analyzeVoice} disabled={analyzing} style={{ ...btnStyle, marginBottom: 12, width: '100%' }}>
                {analyzing ? 'Analyzing...' : '🧬 Analyze my Voice DNA →'}
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} style={btnOutlineStyle}>← Back</button>
                <button onClick={skipVoice} disabled={saving} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-mid)', borderRadius: 50, padding: '11px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--muted)', fontFamily: 'DM Sans,sans-serif' }}>Skip for now</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, marginBottom: 8 }}>You&apos;re all set!</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.7 }}>Your Voice DNA is trained. Every post will sound like you.</p>
              <button onClick={finish} disabled={saving} style={{ ...btnStyle, width: '100%', fontSize: 15 }}>Create my first post →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const iStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid var(--border-mid)', borderRadius: 'var(--r-sm)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none', background: 'white' }
const btnStyle: React.CSSProperties = { display: 'block', width: '100%', padding: '13px 24px', background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }
const btnOutlineStyle: React.CSSProperties = { padding: '11px 20px', background: 'transparent', border: '1.5px solid var(--border-mid)', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--ink)', fontFamily: 'DM Sans,sans-serif' }
