'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from './layout'
import Link from 'next/link'
import { format, subDays } from 'date-fns'

const IDEAS = [
  'The biggest lesson I learned from failing publicly',
  'Why most "productivity hacks" make you less productive',
  'What I wish someone told me in my first 90 days',
  'The uncomfortable truth about networking',
  'One decision that changed the trajectory of my career',
  'Why I turned down a $300K offer (and what happened next)',
  'The skill nobody talks about that separates top performers',
  'What 5 years in startups taught me about corporate life',
]

export default function DashboardHome() {
  const { profile, setTopupModal, setUpgradeModal } = useProfile()
  const router = useRouter()
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [briefIdeas] = useState(() => IDEAS.sort(() => Math.random() - .5).slice(0, 3))
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
    fetch('/api/save-post?limit=5').then(r => r.json()).then(d => setRecentPosts(d.posts || []))
  }, [])

  if (!profile) return null

  const streakDots = Array.from({ length: 14 }, (_, i) => {
    const daysAgo = 13 - i
    const last = profile.last_post_date ? new Date(profile.last_post_date) : null
    const dot = subDays(new Date(), daysAgo)
    const isToday = daysAgo === 0
    const isDone = last && dot <= last && daysAgo < (profile.streak_count || 0)
    return { isToday, isDone }
  })

  const used = profile.posts_used_this_month || 0
  const limit = profile.posts_limit + (profile.extra_credits || 0)
  const firstName = (profile.full_name || 'there').split(' ')[0]

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
          {greeting}, {firstName} · {format(new Date(), 'EEEE, MMMM d')}
        </div>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 32, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.2, marginBottom: 4 }}>
          Your Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          {used === 0 ? "You haven't posted yet this month. Let's change that." : `You've created ${used} post${used > 1 ? 's' : ''} this month. Keep going!`}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Posts This Month', value: used, sub: `of ${limit}`, color: 'var(--blue)', icon: '✦' },
          { label: 'Day Streak', value: profile.streak_count || 0, sub: 'days in a row', color: 'var(--gold)', icon: '🔥' },
          { label: 'Extra Credits', value: profile.extra_credits || 0, sub: 'remaining', color: 'var(--green)', icon: '💳' },
          { label: 'Posts Saved', value: recentPosts.length, sub: 'in library', color: '#7c3aed', icon: '📚' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</span>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 36, fontWeight: 900, letterSpacing: '-1px', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Usage alert */}
      {used >= limit && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--r-md)', padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', marginBottom: 2 }}>🚨 Monthly limit reached</div>
            <div style={{ fontSize: 13, color: '#b91c1c' }}>You&apos;ve used all {limit} posts. Buy extra credits to keep generating.</div>
          </div>
          <button onClick={() => setTopupModal(true)} style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', flexShrink: 0 }}>
            Buy Credits →
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Streak tracker */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '22px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>Posting Streak</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{profile.streak_count || 0} day{(profile.streak_count || 0) !== 1 ? 's' : ''} 🔥</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>
              <div>Last 14 days</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {streakDots.map((d, i) => (
              <div key={i} className={`s-dot${d.isDone ? ' done' : ''}${d.isToday ? ' today' : ''}`} style={{ flex: '0 0 auto' }} />
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)' }}>
            {profile.streak_count >= 7 ? '🏆 Amazing! You\'re on fire!' : 'Post today to keep your streak going'}
          </div>
        </div>

        {/* Weekly content brief */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '22px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Weekly Content Brief</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>3 ideas for you this week ✦</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {briefIdeas.map((idea, i) => (
              <button key={i} onClick={() => router.push(`/dashboard/generate?topic=${encodeURIComponent(idea)}`)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--cream-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: 500, color: 'var(--ink)', fontFamily: 'DM Sans,sans-serif', transition: 'all .18s', lineHeight: 1.5 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--blue-light)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(10,102,194,.2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cream-card)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                <span style={{ color: 'var(--blue)', flexShrink: 0 }}>✦</span>
                {idea}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions + recent posts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 18 }}>
        {/* Quick actions */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '22px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { href: '/dashboard/generate', icon: '✦', label: 'Generate new post', sub: 'AI-powered, 3 variations', color: 'var(--blue)', bg: 'var(--blue-light)' },
              { href: '/dashboard/generate?tab=repurpose', icon: '↺', label: 'Repurpose content', sub: 'Turn article into posts', color: 'var(--green)', bg: '#dcfce7' },
              { href: '/dashboard/comment-reply', icon: '💬', label: 'Reply to comments', sub: 'In your voice', color: '#7c3aed', bg: '#f3e8ff' },
              { href: '/dashboard/settings', icon: '🧬', label: 'Update Voice DNA', sub: 'Improve accuracy', color: 'var(--gold)', bg: 'var(--gold-pale)' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--cream-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', textDecoration: 'none', transition: 'all .18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = a.bg; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cream-card)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent posts */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '22px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Recent Posts</div>
            <Link href="/dashboard/library" style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📝</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>No posts yet</div>
              <div style={{ fontSize: 12 }}>Generate your first post to see it here</div>
              <Link href="/dashboard/generate" style={{ display: 'inline-block', marginTop: 14, padding: '9px 20px', background: 'var(--blue)', color: 'white', borderRadius: 50, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Create first post →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentPosts.slice(0, 4).map(p => (
                <div key={p.id} style={{ padding: '12px 14px', background: 'var(--cream-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.topic}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.final_text?.substring(0, 80)}...</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'var(--blue-light)', color: 'var(--blue)', flexShrink: 0 }}>{p.tone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
