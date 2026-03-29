'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const TONES = ['all','Thought Leader','Storytelling','Educational','Casual & Witty','Motivational','Data-Driven','Controversial','Founder Voice']

export default function LibraryPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string|null>(null)

  useEffect(() => { loadPosts() }, [filter])

  const loadPosts = async () => {
    setLoading(true)
    const res = await fetch(`/api/save-post${filter !== 'all' ? `?tone=${filter}` : ''}`)
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const res = await fetch('/api/save-post', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: id }) })
    if (res.ok) { toast.success('Deleted'); setPosts(p => p.filter(x => x.id !== id)) }
    else toast.error('Delete failed')
  }

  const copyPost = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px', marginBottom: 4 }}>My Library</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>{posts.length} saved posts</p>
        </div>
        <button onClick={() => router.push('/dashboard/generate')} style={{ padding: '11px 20px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
          + New Post
        </button>
      </div>

      {/* Tone filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {TONES.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .18s', fontFamily: 'DM Sans,sans-serif', background: filter === t ? 'var(--ink)' : 'white', border: `1px solid ${filter === t ? 'var(--ink)' : 'var(--border-mid)'}`, color: filter === t ? 'white' : 'var(--ink)' }}>
            {t === 'all' ? 'All tones' : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 180, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 900, color: 'var(--ink)', marginBottom: 8 }}>No saved posts yet</div>
          <div style={{ fontSize: 14, marginBottom: 24 }}>Generate posts and save them to build your library</div>
          <button onClick={() => router.push('/dashboard/generate')} style={{ padding: '12px 24px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Generate first post →</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {posts.map(p => (
            <div key={p.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'}>
              {/* Card header */}
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{p.topic}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'var(--blue-light)', color: 'var(--blue)' }}>{p.tone}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {/* Post body */}
              <div style={{ padding: '14px 18px', cursor: 'pointer' }} onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--ink-soft)', whiteSpace: 'pre-line' }}>
                  {expanded === p.id ? p.final_text : (p.final_text || '').substring(0, 160) + ((p.final_text || '').length > 160 ? '...' : '')}
                </div>
                {(p.final_text || '').length > 160 && (
                  <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, marginTop: 6 }}>{expanded === p.id ? '↑ Show less' : '↓ Show full post'}</div>
                )}
              </div>
              {/* Scores */}
              {p.hook_score > 0 && (
                <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
                  {[['Hook', p.hook_score, 'var(--blue)'], ['Read', p.readability_score, 'var(--green)'], ['Emotion', p.emotion_score, '#7c3aed'], ['CTA', p.cta_score, 'var(--gold)']].map(([label, val, color]) => (
                    <div key={String(label)} style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 3 }}>
                        <span style={{ color: 'var(--muted)' }}>{label}</span>
                        <span style={{ fontWeight: 700, color: color as string }}>{val}%</span>
                      </div>
                      <div style={{ height: 3, background: 'var(--border-mid)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${val}%`, background: color as string, borderRadius: 2, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Actions */}
              <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <button onClick={() => copyPost(p.final_text)} style={{ flex: 1, padding: '8px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Copy</button>
                <button onClick={() => { navigator.clipboard.writeText(p.final_text); window.open('https://linkedin.com/feed/', '_blank') }} style={{ flex: 1, padding: '8px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Post to LinkedIn</button>
                <button onClick={() => deletePost(p.id)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 50, fontSize: 12, cursor: 'pointer', color: 'var(--red)' }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
