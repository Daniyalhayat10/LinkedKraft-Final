'use client'
import { useState } from 'react'
import { useProfile } from '../layout'
import toast from 'react-hot-toast'

const TONES = ['Thought Leader','Storytelling','Educational','Casual & Witty','Motivational','Data-Driven','Controversial','Founder Voice']
const LANGS = [{c:'en',n:'English 🇬🇧'},{c:'de',n:'German 🇩🇪'},{c:'fr',n:'French 🇫🇷'},{c:'ar',n:'Arabic 🇸🇦'},{c:'es',n:'Spanish 🇪🇸'},{c:'pt',n:'Portuguese 🇧🇷'}]

export default function SettingsPage() {
  const { profile, setProfile, setTopupModal, setUpgradeModal } = useProfile()
  const [name, setName] = useState(profile?.full_name || '')
  const [role, setRole] = useState(profile?.role_title || '')
  const [tone, setTone] = useState(profile?.default_tone || 'Thought Leader')
  const [lang, setLang] = useState(profile?.default_language || 'en')
  const [samples, setSamples] = useState(profile?.voice_samples || '')
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [section, setSection] = useState<'profile'|'voice'|'plan'|'billing'>('profile')

  const saveProfile = async () => {
    setSaving(true)
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ full_name: name, role_title: role, default_tone: tone, default_language: lang }) })
    const data = await res.json()
    if (data.profile) { setProfile(data.profile); toast.success('Profile saved!') }
    else toast.error('Save failed')
    setSaving(false)
  }

  const analyzeVoice = async () => {
    if (samples.trim().length < 80) { toast.error('Please add more writing samples (min 80 chars)'); return }
    setAnalyzing(true)
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voice_samples: samples }) })
    const data = await res.json()
    if (data.profile?.voice_dna) { setProfile(data.profile); toast.success('🧬 Voice DNA re-analyzed!') }
    else toast.error('Analysis failed')
    setAnalyzing(false)
  }

  const openBillingPortal = async () => {
    const res = await fetch('/api/lemonsqueezy')
    const { url, error } = await res.json()
    if (error) { toast.error('No billing account found'); return }
    window.location.href = url
  }

  const TABS = [{id:'profile',label:'👤 Profile'},{id:'voice',label:'🧬 Voice DNA'},{id:'plan',label:'💎 Plan & Credits'},{id:'billing',label:'💳 Billing'}]

  return (
    <div style={{ padding: '32px 40px', maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Manage your profile, voice training, and subscription</p>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 4, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setSection(t.id as any)} style={{ padding: '8px 16px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'DM Sans,sans-serif', transition: 'all .18s', background: section === t.id ? 'var(--ink)' : 'transparent', color: section === t.id ? 'white' : 'var(--muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {section === 'profile' && (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Profile Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={iStyle}
                onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--blue)'}
                onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border-mid)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Role / Title</label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="Founder & CEO, Consultant..." style={iStyle}
                onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--blue)'}
                onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border-mid)'} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Default tone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)} style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all .18s', background: tone === t ? 'var(--ink)' : 'var(--cream)', border: `1px solid ${tone === t ? 'var(--ink)' : 'var(--border-mid)'}`, color: tone === t ? 'white' : 'var(--ink)' }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Default language</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {LANGS.map(l => (
                <button key={l.c} onClick={() => setLang(l.c)} style={{ padding: '9px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', background: lang === l.c ? 'var(--blue-light)' : 'var(--cream)', border: `1.5px solid ${lang === l.c ? 'var(--blue)' : 'var(--border)'}`, color: lang === l.c ? 'var(--blue)' : 'var(--ink)' }}>{l.n}</button>
              ))}
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className={saving ? 'btn-loading' : ''} style={{ padding: '11px 24px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {section === 'voice' && (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Voice DNA Training</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Paste 2–3 of your best LinkedIn posts. Our AI analyzes your vocabulary, sentence rhythm, hook style, and signature phrases — then injects your fingerprint into every post generation.
          </p>

          {/* Current DNA */}
          {profile?.voice_dna && Object.keys(profile.voice_dna).length > 0 && (
            <div style={{ background: 'var(--blue-light)', border: '1px solid rgba(10,102,194,.2)', borderRadius: 'var(--r-md)', padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginBottom: 12 }}>🧬 Your Current Voice DNA Fingerprint</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                {Object.entries(profile.voice_dna).map(([k, v]) => (
                  <div key={k} style={{ background: 'white', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Your writing samples</label>
              <span style={{ fontSize: 11, color: 'var(--muted-light)' }}>{samples.length} chars</span>
            </div>
            <textarea value={samples} onChange={e => setSamples(e.target.value)} rows={10}
              placeholder="Paste 2-3 of your real LinkedIn posts here. Include hashtags if you use them. The more authentic, the better the DNA match..."
              style={{ ...iStyle, resize: 'vertical', lineHeight: 1.7 }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--blue)'}
              onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border-mid)'} />
          </div>
          <button onClick={analyzeVoice} disabled={analyzing} className={analyzing ? 'btn-loading' : ''} style={{ padding: '11px 24px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
            {analyzing ? 'Analyzing...' : '🧬 Analyze & Save Voice DNA'}
          </button>
        </div>
      )}

      {section === 'plan' && (
        <div>
          {/* Current plan card */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Current Plan</div>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px' }}>{(profile?.plan || 'Free').toUpperCase()}</div>
              </div>
              {profile?.plan !== 'pro' && (
                <button onClick={() => setUpgradeModal(true)} style={{ padding: '11px 22px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                  Upgrade Plan ↑
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { label: 'Base Posts/Month', value: profile?.posts_limit || 5 },
                { label: 'Extra Credits', value: profile?.extra_credits || 0 },
                { label: 'Used This Month', value: profile?.posts_used_this_month || 0 },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--cream-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '14px 16px' }}>
                  <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Buy credits */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>💳 Buy Extra Posts</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.6 }}>Hit your monthly limit? Buy extra posts instantly. They don&apos;t expire and work on top of your monthly plan.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[{c:10,p:5,per:'$0.50/post'},{c:25,p:10,per:'$0.40/post',best:true},{c:50,p:18,per:'$0.36/post'}].map(pack => (
                <div key={pack.c} style={{ border: `2px solid ${pack.best ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', padding: '16px', textAlign: 'center', position: 'relative', background: pack.best ? 'var(--blue-light)' : 'white' }}>
                  {pack.best && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'var(--blue)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 10px', borderRadius: 10 }}>BEST VALUE</div>}
                  <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, marginBottom: 2 }}>{pack.c}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>posts · {pack.per}</div>
                  <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 900, marginBottom: 12 }}>${pack.p}</div>
                  <button onClick={() => setTopupModal(true)} style={{ width: '100%', padding: '9px', background: pack.best ? 'var(--blue)' : 'var(--ink)', color: 'white', border: 'none', borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Buy</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'billing' && (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Billing & Subscription</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>Manage your subscription, view invoices, and update payment method through the Stripe billing portal.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={openBillingPortal} style={{ padding: '11px 22px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
              Open Billing Portal →
            </button>
            {profile?.plan === 'free' && (
              <button onClick={() => setUpgradeModal(true)} style={{ padding: '11px 22px', background: 'var(--gold-pale)', color: '#8a6820', border: '1px solid rgba(201,168,76,.3)', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                ✦ Upgrade to Paid Plan
              </button>
            )}
          </div>
          <div style={{ marginTop: 24, padding: '16px', background: 'var(--cream-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong>Plan details:</strong><br />
            • Starter ($19/mo): 100 posts, Voice DNA, 5 languages, scheduler<br />
            • Pro Global ($49/mo): Unlimited posts, 8 languages, comment replies, profile rewriter<br />
            • Extra credits: $5 for 10 · $10 for 25 · $18 for 50 posts (never expire)
          </div>
        </div>
      )}
    </div>
  )
}

const iStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid var(--border-mid)',
  borderRadius: 'var(--r-sm)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none', transition: 'border-color .18s',
}
