'use client'
import { useState } from 'react'
import { useProfile } from '../layout'
import toast from 'react-hot-toast'

export default function CommentReplyPage() {
  const { profile, setUpgradeModal } = useProfile()
  const [comment, setComment] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [replies, setReplies] = useState<any[]>([])

  const isPro = profile?.plan === 'starter' || profile?.plan === 'pro'

  const generate = async () => {
    if (!comment.trim()) { toast.error('Paste a comment first'); return }
    if (!isPro) { setUpgradeModal(true); return }
    setLoading(true); setReplies([])
    try {
      const res = await fetch('/api/comment-reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment, context }) })
      const data = await res.json()
      if (data.error === 'Upgrade required') { setUpgradeModal(true); return }
      if (data.error) { toast.error(data.error); return }
      setReplies(data.replies)
    } catch { toast.error('Failed to generate replies') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px', marginBottom: 4 }}>Comment Reply Generator</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Get 3 replies in your voice — thoughtful, playful, or direct. Never stare at a comment wondering what to say.</p>
      </div>

      {!isPro && (
        <div style={{ background: 'var(--gold-pale)', border: '1px solid rgba(201,168,76,.3)', borderRadius: 'var(--r-md)', padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8a6820' }}>✦ Requires Starter or Pro</div>
            <div style={{ fontSize: 12, color: '#a07830' }}>Upgrade to unlock comment replies in your voice</div>
          </div>
          <button onClick={() => setUpgradeModal(true)} style={{ padding: '9px 18px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Upgrade</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Comment received *</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={5} placeholder="Paste the comment you want to reply to..."
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border-mid)', borderRadius: 'var(--r-sm)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none', resize: 'none', lineHeight: 1.6 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Post context (optional)</label>
              <input value={context} onChange={e => setContext(e.target.value)} placeholder="What was your original post about?"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border-mid)', borderRadius: 'var(--r-sm)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none' }} />
            </div>
            <button onClick={generate} disabled={loading || !isPro} className={loading ? 'btn-loading' : ''}
              style={{ width: '100%', padding: '13px', background: isPro ? 'var(--ink)' : '#9ca3af', color: 'white', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: isPro ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans,sans-serif' }}>
              {loading ? 'Generating replies...' : '💬 Generate 3 Replies →'}
            </button>
          </div>

          {/* Voice DNA note */}
          <div style={{ marginTop: 14, background: 'var(--cream-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px', fontSize: 12, color: 'var(--muted)' }}>
            🧬 Replies are generated using your Voice DNA fingerprint so they sound naturally like you.
          </div>
        </div>

        <div>
          {loading && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, textAlign: 'center' }}>
              <div style={{ width: 24, height: 24, border: '3px solid var(--border-mid)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Writing replies in your voice...</div>
            </div>
          )}
          {replies.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {replies.map((r, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: ['var(--blue-light)','var(--gold-pale)','#f3e8ff'][i], color: ['var(--blue)','#8a6820','#7c3aed'][i] }}>{r.style}</span>
                    <button onClick={() => { navigator.clipboard.writeText(r.text); toast.success('Copied!') }} style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Copy</button>
                  </div>
                  <div style={{ padding: '14px 16px', fontSize: 13, lineHeight: 1.7, color: 'var(--ink)' }}>{r.text}</div>
                </div>
              ))}
            </div>
          )}
          {!loading && replies.length === 0 && (
            <div style={{ background: 'white', border: '2px dashed var(--border-mid)', borderRadius: 'var(--r-lg)', padding: '50px 30px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
              <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, fontWeight: 900, color: 'var(--ink)', marginBottom: 6 }}>3 replies will appear here</div>
              <div style={{ fontSize: 13 }}>Thoughtful · Playful · Direct<br/>All in your voice</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
