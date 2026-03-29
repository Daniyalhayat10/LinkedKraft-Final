'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import Link from 'next/link'
import toast from 'react-hot-toast'

const ProfileCtx = createContext<any>(null)
export const useProfile = () => useContext(ProfileCtx)

const NAV = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/dashboard/generate', icon: '✦', label: 'Generate Post' },
  { href: '/dashboard/library', icon: '📚', label: 'My Library' },
  { href: '/dashboard/schedule', icon: '📅', label: 'Schedule' },
  { href: '/dashboard/templates', icon: '🎨', label: 'Templates' },
  { href: '/dashboard/comment-reply', icon: '💬', label: 'Comment Replies' },
  { href: '/dashboard/settings', icon: '⚙', label: 'Settings' },
]

const CSS = `
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.nav-link{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;text-decoration:none;font-size:13.5px;font-weight:500;color:var(--muted);transition:all .18s;cursor:pointer;border:none;background:none;width:100%;font-family:DM Sans,sans-serif}
.nav-link:hover,.nav-link.active{background:var(--blue-light);color:var(--blue)}
.nav-link.active{font-weight:700}
`

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [topupModal, setTopupModal] = useState(false)
  const [upgradeModal, setUpgradeModal] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      const res = await fetch('/api/profile')
      const data = await res.json()
      setProfile(data.profile)
      setLoading(false)

      // Show upgrade success toast
      const params = new URLSearchParams(window.location.search)
      if (params.get('upgrade') === 'success') toast.success('🎉 Plan upgraded successfully!')
      if (params.get('topup') === 'success') toast.success(`✨ ${params.get('credits')} extra posts added!`)
    }
    check()
  }, [pathname])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border-mid)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 14, color: 'var(--muted)', fontFamily: 'DM Sans,sans-serif' }}>Loading your dashboard...</div>
      </div>
    </div>
  )

  const used = profile?.posts_used_this_month || 0
  const limit = profile?.posts_limit || 5
  const extra = profile?.extra_credits || 0
  const totalLimit = limit + extra
  const usagePct = Math.min((used / totalLimit) * 100, 100)
  const isLow = used >= totalLimit * 0.8
  const isOut = used >= totalLimit

  return (
    <ProfileCtx.Provider value={{ profile, setProfile, setTopupModal, setUpgradeModal }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
        <style>{CSS}</style>

        {/* SIDEBAR */}
        <aside style={{ width: 'var(--sidebar,232px)', flexShrink: 0, background: 'white', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, overflowY: 'auto' }}>
          {/* Logo */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
            <Link href="/dashboard" style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, fontWeight: 900, textDecoration: 'none', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M7.5 3v9" stroke="white" strokeWidth="1.6" strokeLinecap="round" /><circle cx="7.5" cy="7.5" r="2.4" fill="white" /></svg>
              </div>
              Linked<span style={{ color: 'var(--blue)' }}>Craft</span>
            </Link>
          </div>

          {/* Plan badge */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', padding: '3px 9px', borderRadius: 20, background: profile?.plan === 'pro' ? 'var(--gold-pale)' : profile?.plan === 'starter' ? 'var(--blue-light)' : 'var(--cream)', color: profile?.plan === 'pro' ? '#8a6820' : profile?.plan === 'starter' ? 'var(--blue)' : 'var(--muted)' }}>
                {profile?.plan?.toUpperCase() || 'FREE'}
              </span>
              {extra > 0 && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)', background: '#dcfce7', padding: '2px 7px', borderRadius: 10 }}>+{extra} credits</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: isOut ? 'var(--red)' : isLow ? 'var(--orange)' : 'var(--muted)', marginBottom: 4, fontWeight: 500 }}>
              <span>{used}/{totalLimit} posts used</span>
              {isOut && <span style={{ fontWeight: 700 }}>Limit reached</span>}
              {isLow && !isOut && <span>Running low</span>}
            </div>
            <div style={{ height: 4, background: 'var(--border-mid)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${usagePct}%`, background: isOut ? 'var(--red)' : isLow ? 'var(--orange)' : 'var(--blue)', transition: 'width .5s ease' }} />
            </div>
            {isOut && (
              <button onClick={() => setTopupModal(true)} style={{ display: 'block', width: '100%', marginTop: 8, padding: '8px', background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                🔋 Buy more posts
              </button>
            )}
            {isLow && !isOut && (
              <button onClick={() => setTopupModal(true)} style={{ display: 'block', width: '100%', marginTop: 8, padding: '7px', background: 'rgba(234,88,12,.1)', color: 'var(--orange)', border: '1px solid rgba(234,88,12,.2)', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                + Add extra credits
              </button>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 10px' }}>
            {NAV.map(item => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className={`nav-link${isActive ? ' active' : ''}`}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User footer */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            {profile?.plan !== 'pro' && (
              <button onClick={() => setUpgradeModal(true)} style={{ display: 'block', width: '100%', padding: '10px', marginBottom: 10, background: 'var(--gold-pale)', border: '1px solid rgba(201,168,76,.3)', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#8a6820', fontFamily: 'DM Sans,sans-serif', textAlign: 'center' }}>
                ✦ Upgrade to Pro
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),var(--blue-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {(profile?.full_name || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'User'}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
              </div>
              <button onClick={signOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--muted-light)', padding: 4 }}>→</button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, marginLeft: 'var(--sidebar,232px)', minHeight: '100vh', overflow: 'auto' }}>
          {children}
        </main>
      </div>

      {/* TOP-UP MODAL */}
      {topupModal && <TopupModal onClose={() => setTopupModal(false)} plan={profile?.plan} />}
      {upgradeModal && <UpgradeModal onClose={() => setUpgradeModal(false)} />}
    </ProfileCtx.Provider>
  )
}

function TopupModal({ onClose, plan }: { onClose: () => void, plan: string }) {
  const [loading, setLoading] = useState<number | null>(null)
  const PACKS = [
    { credits: 10, price: 8, label: '10 Posts', per: '$0.80/post' },
    { credits: 25, price: 20, label: '25 Posts', per: '$0.80/post', popular: true },
    { credits: 50, price: 40, label: '50 Posts', per: '$0.80/post' },
  ]

  const buyTopup = async (credits: number) => {
    setLoading(credits)
    try {
      const res = await fetch('/api/lemonsqueezy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'topup', credits }) })
      const { url, error } = await res.json()
      if (error) { toast.error(error); return }
      window.location.href = url
    } catch { toast.error('Payment failed') } finally { setLoading(null) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,13,13,.55)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', zIndex: 1, background: 'white', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-xl)', padding: '36px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, border: 'none', background: 'var(--cream)', borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: 'var(--muted)' }}>✕</button>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>💳</div>
          <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Buy Extra Posts</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Credits are added instantly. No plan change needed. They don&apos;t expire.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
          {PACKS.map(p => (
            <div key={p.credits} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', border: `2px solid ${p.popular ? 'var(--blue)' : 'var(--border-mid)'}`, borderRadius: 'var(--r-md)', background: p.popular ? 'var(--blue-light)' : 'white', position: 'relative' }}>
              {p.popular && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--blue)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 10 }}>BEST VALUE</div>}
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.per}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 900 }}>${p.price}</div>
                <button onClick={() => buyTopup(p.credits)} disabled={loading !== null} className={loading === p.credits ? 'btn-loading' : ''} style={{ padding: '9px 18px', background: p.popular ? 'var(--blue)' : 'var(--ink)', color: 'white', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', minWidth: 80 }}>
                  {loading === p.credits ? '...' : 'Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {plan === 'free' && (
          <div style={{ background: 'var(--gold-pale)', border: '1px solid rgba(201,168,76,.3)', borderRadius: 'var(--r-sm)', padding: '12px 16px', fontSize: 13, color: '#8a6820' }}>
            💡 <strong>Upgrade to Starter ($19/mo)</strong> for 100 posts/month and unlock all features.
          </div>
        )}
      </div>
    </div>
  )
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const checkout = async (plan: string) => {
    setLoading(plan)
    try {
      const res = await fetch('/api/lemonsqueezy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan, billing }) })
      const { url, error } = await res.json()
      if (error) { toast.error(error); return }
      window.location.href = url
    } catch { toast.error('Checkout failed') } finally { setLoading(null) }
  }

  const PLANS = [
    { id: 'starter', name: 'Starter', pm: 19, pa: 15, features: ['100 posts/month', 'Voice DNA', '5 languages', 'Post Intelligence', 'Scheduler'] },
    { id: 'pro', name: 'Pro Global', pm: 49, pa: 39, features: ['Unlimited posts', '8 languages + Arabic', 'Comment Replies', 'Profile Rewriter', 'Priority support'], gold: true },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,13,13,.55)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', zIndex: 1, background: 'white', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 560, boxShadow: 'var(--shadow-xl)', padding: '36px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, border: 'none', background: 'var(--cream)', borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: 'var(--muted)' }}>✕</button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Upgrade Your Plan</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Unlock unlimited posts and all premium features.</p>
        </div>
        <div style={{ display: 'inline-flex', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 50, overflow: 'hidden', margin: '0 auto 24px', justifyContent: 'center' }}>
          {(['monthly', 'annual'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ padding: '8px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', borderRadius: 50, background: billing === b ? 'var(--ink)' : 'transparent', color: billing === b ? 'white' : 'var(--muted)', fontFamily: 'DM Sans,sans-serif', transition: 'all .2s' }}>
              {b === 'monthly' ? 'Monthly' : 'Annual (–20%)'}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {PLANS.map(p => (
            <div key={p.id} style={{ border: `2px solid ${p.gold ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--r-lg)', padding: '22px 20px', background: p.gold ? 'var(--gold-pale)' : 'white' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: p.gold ? '#8a6820' : 'var(--muted)', marginBottom: 10 }}>{p.name}</div>
              <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 36, fontWeight: 900, marginBottom: 14 }}>${billing === 'annual' ? p.pa : p.pm}<span style={{ fontSize: 13, fontWeight: 400, opacity: .5 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
                {p.features.map(f => <li key={f} style={{ fontSize: 12, display: 'flex', gap: 7 }}><span style={{ color: p.gold ? 'var(--gold)' : 'var(--blue)' }}>✓</span>{f}</li>)}
              </ul>
              <button onClick={() => checkout(p.id)} disabled={loading !== null} className={loading === p.id ? 'btn-loading' : ''} style={{ width: '100%', padding: '10px', background: p.gold ? 'var(--ink)' : 'var(--blue)', color: 'white', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                Upgrade →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
