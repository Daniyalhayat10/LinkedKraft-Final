'use client'
import { useRouter } from 'next/navigation'
import { useProfile } from '../layout'

const TEMPLATES = [
  { icon: '📖', title: 'Personal Story', desc: 'Vulnerable narrative with emotional arc', tone: 'Storytelling', prompt: 'Tell a personal story about a challenge you overcame at work', pro: false },
  { icon: '💡', title: 'Contrarian Insight', desc: 'Challenge conventional wisdom', tone: 'Thought Leader', prompt: 'Share a counterintuitive insight about your industry that most people get wrong', pro: false },
  { icon: '📋', title: 'Lessons Learned', desc: 'List format with deep insights', tone: 'Educational', prompt: '5 things I learned from [experience] that changed how I work', pro: false },
  { icon: '🔥', title: 'Hot Take', desc: 'Bold opinion that invites debate', tone: 'Controversial', prompt: 'Share a hot take about a common belief in your industry', pro: true },
  { icon: '📊', title: 'Data Story', desc: 'Back a bold claim with numbers', tone: 'Data-Driven', prompt: 'Share a surprising statistic and what it means for your audience', pro: true },
  { icon: '🚀', title: 'Behind The Scenes', desc: 'Show the real process', tone: 'Founder Voice', prompt: 'Share what really goes on behind the scenes of [your work]', pro: true },
  { icon: '🎯', title: 'Advice Post', desc: 'Actionable tips for your audience', tone: 'Educational', prompt: 'The best advice I give to people starting out in my field', pro: false },
  { icon: '❤️', title: 'Gratitude/Win', desc: 'Celebrate a milestone authentically', tone: 'Motivational', prompt: 'Share a recent win and what you learned from getting there', pro: true },
  { icon: '⚡', title: 'Quick Tip', desc: 'One punchy insight in short form', tone: 'Casual & Witty', prompt: 'Share one small thing that has a disproportionate impact on your productivity', pro: false },
]

export default function TemplatesPage() {
  const router = useRouter()
  const { profile, setUpgradeModal } = useProfile()
  const isPro = profile?.plan === 'starter' || profile?.plan === 'pro'

  const useTemplate = (t: typeof TEMPLATES[0]) => {
    if (t.pro && !isPro) { setUpgradeModal(true); return }
    router.push(`/dashboard/generate?topic=${encodeURIComponent(t.prompt)}&tone=${encodeURIComponent(t.tone)}`)
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px', marginBottom: 4 }}>Post Templates</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Battle-tested frameworks that consistently drive engagement. Click any to use.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {TEMPLATES.map(t => (
          <div key={t.title}
            onClick={() => useTemplate(t)}
            style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '22px', cursor: 'pointer', position: 'relative', transition: 'all .2s', boxShadow: 'var(--shadow-sm)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(10,102,194,.25)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
            {t.pro && !isPro && (
              <div style={{ position: 'absolute', top: 14, right: 14, background: 'var(--gold-pale)', border: '1px solid rgba(201,168,76,.3)', padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: '#8a6820' }}>PRO</div>
            )}
            <div style={{ fontSize: 28, marginBottom: 12 }}>{t.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>{t.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>{t.desc}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: 'var(--blue-light)', color: 'var(--blue)' }}>{t.tone}</span>
              <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>Use template →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
