'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const TONES = ['Thought Leader','Storytelling','Educational','Casual & Witty','Motivational','Data-Driven','Controversial','Founder Voice']
const FEATURES = [
  {icon:'🧬',title:'Voice DNA Engine',desc:'Paste 3 posts. We extract your vocabulary, rhythm, sentence patterns — injected into every generation so it sounds exactly like you.',bg:'#e8f1fb'},
  {icon:'⚡',title:'3 Variations Every Time',desc:'Story, Insight, Bold Opinion — every single generate. Pick your best, edit inline, score before posting. Never blank-page again.',bg:'#fdf6e3'},
  {icon:'🌍',title:'8 Languages, Culturally Adapted',desc:"Not just translated — rewritten for how professionals actually think in German, French, Arabic (RTL), Spanish and 4 more.",bg:'#e8f8f0'},
  {icon:'📊',title:'Post Intelligence Score',desc:'Hook strength, readability, emotional resonance, CTA clarity — with specific improvement suggestions before you hit post.',bg:'#e8f1fb'},
  {icon:'💬',title:'Comment Reply Generator',desc:'Paste any comment, get 3 replies in your voice. Thoughtful, playful, or direct. Stay engaged without the mental drain.',bg:'#fdf6e3'},
  {icon:'↺',title:'Repurpose Anything',desc:'Drop in a podcast, article URL, or transcript. Get 3 ready-to-post LinkedIn posts in your voice. Content multiplied.',bg:'#e8f8f0'},
  {icon:'📅',title:'Smart Scheduler',desc:'See your whole week. Post at the optimal times your audience is most active. Build consistency without thinking about it.',bg:'#fdf6e3'},
  {icon:'📎',title:'500+ Hook Library',desc:'Browse 500+ opening hooks by tone. Click any to instantly fill your post. The first line determines everything.',bg:'#e8f8f0'},
  {icon:'💳',title:'Pay-as-you-go Credits',desc:"Hit your monthly limit? Buy 10, 25, or 50 extra posts instantly. No plan change needed. Scale when you need it.",bg:'#e8f1fb'},
]
const TESTIMONIALS = [
  {q:"I was skeptical — every AI tool sounds robotic. LinkedKraft is different. My audience literally said 'you've been posting differently lately, what changed?' Engagement up 340% in a month.",n:'Marcus Chen',r:'SaaS Founder · 47K followers',g:'linear-gradient(135deg,#667eea,#764ba2)',i:'M'},
  {q:"The multilingual support is genuinely impressive. I post in German and English every week. It doesn't just translate — it writes differently in each language, like a native speaker would.",n:'Katharina Weber',r:'Consultant · Frankfurt · 22K followers',g:'linear-gradient(135deg,#f093fb,#f5576c)',i:'K'},
  {q:"The 3-variation feature changed my process completely. I used to spend 45 minutes on one post. Now I generate 3 options in 12 seconds and pick the best. The ROI is ridiculous.",n:'Ryan Kowalski',r:'Marketing Director · 18K followers',g:'linear-gradient(135deg,#4facfe,#00f2fe)',i:'R'},
]
const CSS_ANIM = `
@keyframes orbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
@keyframes shimmer{to{background-position:-200% center}}
@keyframes trustScroll{to{transform:translateX(-50%)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes badgePulse{0%{box-shadow:0 0 0 0 rgba(201,168,76,.6)}70%{box-shadow:0 0 0 8px rgba(201,168,76,0)}100%{box-shadow:0 0 0 0 rgba(201,168,76,0)}}
@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes greenPulse{0%{box-shadow:0 0 0 0 rgba(22,163,74,.5)}70%{box-shadow:0 0 0 7px rgba(22,163,74,0)}100%{box-shadow:0 0 0 0 rgba(22,163,74,0)}}
.typing-cursor{display:inline-block;width:2px;height:14px;background:var(--blue);vertical-align:text-bottom;margin-left:1px;animation:cursorBlink 1s step-end infinite}
.sr{opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease}
.sr.in{opacity:1;transform:none}
.sr-d1{transition-delay:.1s}.sr-d2{transition-delay:.2s}.sr-d3{transition-delay:.3s}
.badge-pulse{width:7px;height:7px;border-radius:50%;background:var(--gold);display:inline-block;animation:badgePulse 2.2s ease infinite}
.live-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;animation:greenPulse 2s infinite}
`

export default function Landing() {
  const router = useRouter()
  const [tone, setTone] = useState(0)
  const [billing, setBilling] = useState<'monthly'|'annual'>('monthly')
  const [modal, setModal] = useState<'signup'|'login'|null>(null)
  const [email,setEmail]=useState('');const [pass,setPass]=useState('');const [name,setName]=useState('')
  const [loading,setLoading]=useState(false);const [err,setErr]=useState('')
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}})=>{ if(session) router.push('/dashboard') })
    const t = setInterval(()=>setTone(p=>(p+1)%TONES.length),2400)
    const obs = new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.1,rootMargin:'0px 0px -40px 0px'})
    document.querySelectorAll('.sr').forEach(el=>obs.observe(el))
    return ()=>{ clearInterval(t); obs.disconnect() }
  },[])

  const handleAuth = async(e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true); setErr('')
    try {
      if(modal==='signup'){
        const {error} = await supabase.auth.signUp({email,password:pass,options:{data:{full_name:name}}})
        if(error) throw error
        toast.success('Account created! Setting up your profile...')
        router.push('/onboarding')
      } else {
        const {error} = await supabase.auth.signInWithPassword({email,password:pass})
        if(error) throw error
        router.push('/dashboard')
      }
    } catch(e:any){ setErr(e.message) } finally{ setLoading(false) }
  }

  const S:Record<string,React.CSSProperties> = {
    page:{background:'var(--cream)',minHeight:'100vh',overflowX:'hidden'},
    nav:{position:'fixed',top:0,width:'100%',zIndex:200,height:68,display:'flex',alignItems:'center',background:'rgba(245,240,232,.92)',backdropFilter:'blur(16px)',borderBottom:'1px solid var(--border)'},
    navInner:{maxWidth:1160,margin:'0 auto',padding:'0 48px',width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'},
    logo:{fontFamily:'Playfair Display,serif',fontSize:21,fontWeight:900,display:'flex',alignItems:'center',gap:9,cursor:'pointer',textDecoration:'none',color:'var(--ink)'},
    logoIcon:{width:32,height:32,borderRadius:9,background:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center'},
    navLinks:{display:'flex',gap:34,listStyle:'none'},
    navBtn:{background:'var(--ink)',color:'var(--cream)',border:'none',padding:'9px 20px',borderRadius:50,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .2s'},
    section:{maxWidth:1160,margin:'0 auto',padding:'0 48px'},
    eyebrow:{fontSize:11,fontWeight:600,letterSpacing:'.13em',textTransform:'uppercase' as const,color:'var(--blue)',marginBottom:18,display:'flex',alignItems:'center',gap:8},
    h2:{fontFamily:'Playfair Display,serif',fontSize:'clamp(36px,4vw,54px)',fontWeight:900,lineHeight:1.1,letterSpacing:'-1.5px',marginBottom:18},
    btnPrimary:{background:'var(--ink)',color:'var(--cream)',border:'none',padding:'14px 32px',borderRadius:50,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',boxShadow:'0 4px 16px rgba(13,13,13,.18)',transition:'all .2s'},
    btnOutline:{background:'transparent',color:'var(--ink)',border:'1.5px solid var(--border-mid)',padding:'13px 28px',borderRadius:50,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .2s'},
    card:{background:'white',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',padding:'34px 28px',boxShadow:'var(--shadow-sm)',transition:'transform .22s,box-shadow .22s'},
  }

  const prices = {starter:{m:19,a:15},pro:{m:49,a:39}}

  return (
    <div style={S.page}>
      <style>{CSS_ANIM}</style>
      {/* Orbs */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        <div style={{position:'absolute',width:600,height:600,top:-150,left:'50%',marginLeft:-300,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,102,194,.11) 0%,transparent 68%)',filter:'blur(60px)',animation:'orbFloat 14s linear infinite'}}/>
        <div style={{position:'absolute',width:400,height:400,bottom:'5%',right:-100,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,.14) 0%,transparent 68%)',filter:'blur(55px)',animation:'orbFloat 18s linear infinite reverse'}}/>
        <div style={{position:'absolute',width:280,height:280,top:'40%',left:-60,borderRadius:'50%',background:'radial-gradient(circle,rgba(10,102,194,.07) 0%,transparent 68%)',filter:'blur(50px)',animation:'orbFloat 11s linear infinite',animationDelay:'-5s'}}/>
      </div>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo}>
            <div style={S.logoIcon}><svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M4 8.5h9M8.5 4v9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><circle cx="8.5" cy="8.5" r="2.8" fill="white"/></svg></div>
            Linked<span style={{color:'var(--blue)'}}>Craft</span>
          </div>
          <ul style={S.navLinks}>
            {['Features','How it works','Pricing'].map(l=>(
              <li key={l}><a onClick={()=>document.getElementById(l.toLowerCase().replace(/ /g,'-'))?.scrollIntoView({behavior:'smooth'})}
                style={{fontSize:14,fontWeight:500,color:'var(--muted)',cursor:'pointer',textDecoration:'none'}}
                onMouseEnter={e=>(e.target as HTMLElement).style.color='var(--ink)'}
                onMouseLeave={e=>(e.target as HTMLElement).style.color='var(--muted)'}>{l}</a></li>
            ))}
          </ul>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <button onClick={()=>setModal('login')} style={{background:'transparent',border:'none',cursor:'pointer',fontSize:14,fontWeight:500,color:'var(--muted)',padding:'8px 14px',fontFamily:'DM Sans,sans-serif'}}>Sign in</button>
            <button onClick={()=>setModal('signup')} style={S.navBtn}
              onMouseEnter={e=>(e.target as HTMLElement).style.background='var(--blue)'}
              onMouseLeave={e=>(e.target as HTMLElement).style.background='var(--ink)'}>Start free trial →</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'130px 24px 64px',position:'relative',zIndex:1}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'white',border:'1px solid var(--border-mid)',padding:'7px 18px',borderRadius:50,fontSize:11,fontWeight:600,letterSpacing:'.09em',textTransform:'uppercase',color:'var(--ink)',marginBottom:32,boxShadow:'var(--shadow-sm)',animation:'fadeUp .6s ease both'}}>
          <span className="badge-pulse"/> AI-powered · Human-sounding · 8 Languages · Real Results
        </div>
        <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(52px,7vw,96px)',fontWeight:900,lineHeight:1.04,letterSpacing:'-2.5px',maxWidth:900,marginBottom:26,animation:'fadeUp .6s .07s ease both'}}>
          Write LinkedIn posts<br/>
          <em style={{fontStyle:'italic',background:'linear-gradient(100deg,var(--blue) 0%,#1976d2 50%,var(--blue) 100%)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',animation:'shimmer 4s linear infinite'}}>the world stops to read.</em>
        </h1>
        <p style={{fontSize:18,lineHeight:1.72,color:'var(--muted)',maxWidth:520,marginBottom:40,animation:'fadeUp .6s .14s ease both'}}>
          LinkedKraft learns exactly how you write, then generates posts that sound eerily like you — in any language. Not robotic AI. Just you, at your absolute best.
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:14,animation:'fadeUp .6s .21s ease both'}}>
          <button onClick={()=>setModal('signup')} style={S.btnPrimary}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--blue)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='var(--ink)';(e.currentTarget as HTMLElement).style.transform='none'}}>Start free for 7 days</button>
          <button onClick={()=>document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})} style={S.btnOutline}>See how it works</button>
        </div>
        <p style={{fontSize:12,color:'var(--muted-light)',marginBottom:56,animation:'fadeUp .6s .28s ease both'}}>No credit card required · Cancel anytime · 7-day free trial</p>

        {/* Hero Card */}
        <div style={{width:'100%',maxWidth:660,animation:'fadeUp .7s .35s ease both'}}>
          <div style={{background:'white',border:'1px solid var(--border)',borderRadius:'var(--r-xl)',overflow:'hidden',boxShadow:'var(--shadow-xl)',textAlign:'left'}}>
            <div style={{background:'#fafafa',borderBottom:'1px solid var(--border)',padding:'13px 18px',display:'flex',alignItems:'center',gap:10}}>
              <div style={{display:'flex',gap:6}}>
                {['#ff5f56','#ffbd2e','#28c840'].map(c=><span key={c} style={{width:11,height:11,borderRadius:'50%',background:c,display:'block'}}/>)}
              </div>
              <span style={{flex:1,textAlign:'center',fontFamily:'DM Mono,monospace',fontSize:11,color:'var(--muted-light)'}}>linkedkraft · voice_engine · generating...</span>
              <span style={{display:'flex',alignItems:'center',gap:5,fontFamily:'DM Mono,monospace',fontSize:10,color:'#22c55e'}}><span className="live-dot"/>live</span>
            </div>
            <div style={{padding:'24px 26px'}}>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:11,color:'var(--muted-light)',marginBottom:16}}>
                <span style={{color:'var(--blue)',fontWeight:500}}>craft</span> generate --topic <span style={{color:'var(--gold)'}}>&#34;12 investor rejections&#34;</span> --tone <span style={{color:'var(--gold)'}}>storytelling</span>
              </div>
              <div style={{background:'var(--cream-card)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',padding:'20px 22px'}}>
                <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:14}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#667eea,#764ba2)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:14,flexShrink:0}}>S</div>
                  <div><div style={{fontSize:13,fontWeight:700}}>Sarah Mitchell</div><div style={{fontSize:11,color:'var(--muted)'}}>VP of Sales · LinkedIn Top Voice</div></div>
                </div>
                <div style={{fontSize:14,lineHeight:1.78,color:'var(--ink-soft)'}}>
                  <strong>I got rejected by 12 investors in one week.</strong><br/><br/>
                  Here&apos;s what I learned that no MBA course ever taught me:<br/><br/>
                  Rejection isn&apos;t a red light. It&apos;s a compass.<br/><br/>
                  Every &#34;no&#34; came with a clue. I was pitching the product when I should&apos;ve been selling the story. The moment I flipped that — everything changed.<span className="typing-cursor"/>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)',flexWrap:'wrap',gap:8}}>
                  <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                    <span style={{padding:'3px 11px',borderRadius:20,fontSize:10,fontWeight:600,background:'var(--blue-light)',color:'var(--blue)'}}>✦ Storytelling</span>
                    <span style={{padding:'3px 11px',borderRadius:20,fontSize:10,fontWeight:600,background:'var(--gold-pale)',color:'#8a6820',border:'1px solid rgba(201,168,76,.2)'}}>Human Score: 97%</span>
                  </div>
                  <div style={{display:'flex',gap:14}}>
                    <span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:'var(--muted-light)'}}>Reach: <strong style={{color:'var(--ink)'}}>18K–41K</strong></span>
                    <span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:'var(--muted-light)'}}>Eng: <strong style={{color:'var(--ink)'}}>4.1%</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tone pills */}
        <div style={{marginTop:48,display:'flex',flexWrap:'wrap',gap:9,justifyContent:'center',padding:'0 20px'}}>
          {TONES.map((t,i)=>(
            <button key={t} onClick={()=>setTone(i)} style={{padding:'9px 20px',borderRadius:50,background:tone===i?'var(--ink)':'white',border:`1px solid ${tone===i?'var(--ink)':'var(--border-mid)'}`,fontSize:13,fontWeight:500,color:tone===i?'white':'var(--ink)',cursor:'pointer',transition:'all .18s',fontFamily:'DM Sans,sans-serif',boxShadow:'var(--shadow-sm)'}}>{t}</button>
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'20px 0',overflow:'hidden',background:'rgba(255,255,255,.5)',position:'relative',zIndex:1}}>
        <div style={{display:'flex',alignItems:'center'}}>
          <div style={{flexShrink:0,padding:'0 40px 0 48px',fontSize:11,fontWeight:600,color:'var(--muted-light)',letterSpacing:'.1em',textTransform:'uppercase',whiteSpace:'nowrap',borderRight:'1px solid var(--border)'}}>Used by creators at</div>
          <div style={{display:'flex',gap:52,animation:'trustScroll 22s linear infinite',paddingLeft:52,whiteSpace:'nowrap',flexShrink:0}}>
            {['Google','McKinsey','Stripe','Notion','Figma','Shopify','Y Combinator','HubSpot','Salesforce','Airbnb','Google','McKinsey','Stripe','Notion','Figma','Shopify','Y Combinator','HubSpot','Salesforce','Airbnb'].map((c,i)=>(
              <span key={i} style={{fontSize:14,fontWeight:700,color:'rgba(13,13,13,.18)'}}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{padding:'80px 0',position:'relative',zIndex:1}}>
        <div style={S.section}>
          <div className="sr" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',overflow:'hidden',background:'white',boxShadow:'var(--shadow-sm)'}}>
            {[['97%','Pass AI-detection as human writing'],['340%','Avg engagement lift in 30 days'],['12K+','Active LinkedIn creators'],['8','Languages supported natively']].map(([n,d],i)=>(
              <div key={i} style={{padding:'36px 28px',borderRight:i<3?'1px solid var(--border)':'none',transition:'background .2s'}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--blue-light)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='white'}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:46,fontWeight:900,letterSpacing:'-2px',lineHeight:1,marginBottom:8}}>{n}</div>
                <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.55}}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{padding:'96px 0',position:'relative',zIndex:1}}>
        <div style={S.section}>
          <div className="sr eyebrow" style={{fontSize:11,fontWeight:600,letterSpacing:'.13em',textTransform:'uppercase',color:'var(--blue)',marginBottom:18,display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:18,height:1.5,background:'var(--blue)',display:'block'}}/>Why LinkedKraft
          </div>
          <h2 className="sr sr-d1" style={{...S.h2}}>Every word sounds like<br/><em style={{fontStyle:'italic',color:'var(--blue)'}}>you wrote it.</em></h2>
          <p className="sr sr-d2" style={{fontSize:17,color:'var(--muted)',lineHeight:1.72,maxWidth:500,marginBottom:56}}>Our AI doesn&apos;t fill templates — it learns your patterns, mirrors your rhythm, and removes every trace of generic writing.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {FEATURES.map((f,i)=>(
              <div key={f.title} className={`sr sr-d${i%3}`} style={{...S.card,cursor:'default'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-5px)';el.style.boxShadow='var(--shadow-md)';el.style.borderColor='rgba(10,102,194,.18)'}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='none';el.style.boxShadow='var(--shadow-sm)';el.style.borderColor='var(--border)'}}>
                <div style={{width:46,height:46,borderRadius:'var(--r-sm)',background:f.bg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,fontSize:22,border:'1px solid var(--border)'}}>{f.icon}</div>
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:9,letterSpacing:'-.2px'}}>{f.title}</h3>
                <p style={{fontSize:13,color:'var(--muted)',lineHeight:1.72}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how-it-works" style={{background:'var(--ink)',color:'var(--cream)',padding:'96px 0',position:'relative',zIndex:1,overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)',backgroundSize:'56px 56px',pointerEvents:'none'}}/>
        <div style={{...S.section,position:'relative'}}>
          <div className="sr" style={{fontSize:11,fontWeight:600,letterSpacing:'.13em',textTransform:'uppercase',color:'var(--gold)',marginBottom:18,display:'flex',alignItems:'center',gap:8}}><span style={{width:18,height:1.5,background:'var(--gold)',display:'block'}}/>Process</div>
          <h2 className="sr sr-d1" style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(36px,4vw,54px)',fontWeight:900,lineHeight:1.1,letterSpacing:'-1.5px',color:'var(--cream)',marginBottom:64}}>
            From idea to post<br/><em style={{fontStyle:'italic',color:'var(--gold)'}}>in 60 seconds.</em>
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',position:'relative'}}>
            <div style={{position:'absolute',top:27,left:'12.5%',right:'12.5%',height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,.12),rgba(255,255,255,.12),transparent)'}}/>
            {[
              ['Train your voice','Paste 3 posts. We extract your writing DNA — vocabulary, rhythm, emotional style — in under 30 seconds.'],
              ['Pick topic + tone','Type your idea, select tone and language. Browse 500+ hooks for inspiration. That\'s your entire input.'],
              ['Choose your variation','Get Story, Insight, Bold Opinion every time. Select, edit inline, score with AI before posting.'],
              ['Post or schedule','Copy to LinkedIn in one click (auto-copies text) or schedule at the optimal time. Streak tracker keeps you consistent.'],
            ].map(([t,d],i)=>(
              <div key={t} className={`sr sr-d${i}`} style={{padding:'0 24px'}}>
                <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:900,color:'var(--gold)',marginBottom:24,position:'relative',zIndex:1,transition:'all .25s'}}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(201,168,76,.12)';el.style.borderColor='var(--gold)';el.style.transform='scale(1.06)'}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(255,255,255,.06)';el.style.borderColor='rgba(255,255,255,.12)';el.style.transform='none'}}>{i+1}</div>
                <h4 style={{fontSize:15,fontWeight:700,marginBottom:9,color:'var(--cream)'}}>{t}</h4>
                <p style={{fontSize:13,color:'rgba(245,240,232,.55)',lineHeight:1.68}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{padding:'96px 0',position:'relative',zIndex:1}}>
        <div style={S.section}>
          <div className="sr" style={{fontSize:11,fontWeight:600,letterSpacing:'.13em',textTransform:'uppercase',color:'var(--blue)',marginBottom:18,display:'flex',alignItems:'center',gap:8}}><span style={{width:18,height:1.5,background:'var(--blue)',display:'block'}}/>Social Proof</div>
          <h2 className="sr sr-d1" style={S.h2}>Real creators.<br/><em style={{fontStyle:'italic',color:'var(--blue)'}}>Real results.</em></h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:48}}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={t.n} className={`sr sr-d${i}`} style={{...S.card}}>
                <div style={{color:'var(--gold)',fontSize:14,marginBottom:14}}>★★★★★</div>
                <p style={{fontSize:14,lineHeight:1.75,color:'var(--muted)',marginBottom:20,fontStyle:'italic'}}>&#34;{t.q}&#34;</p>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:t.g,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13,flexShrink:0}}>{t.i}</div>
                  <div><div style={{fontSize:13,fontWeight:700}}>{t.n}</div><div style={{fontSize:11,color:'var(--muted)'}}>{t.r}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div id="pricing" style={{background:'var(--ink)',color:'var(--cream)',padding:'96px 0',position:'relative',zIndex:1,overflow:'hidden'}}>
        <div style={{position:'absolute',top:-150,left:'50%',transform:'translateX(-50%)',width:700,height:300,background:'radial-gradient(ellipse,rgba(10,102,194,.14),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{...S.section,position:'relative',zIndex:1}}>
          <div className="sr" style={{fontSize:11,fontWeight:600,letterSpacing:'.13em',textTransform:'uppercase',color:'var(--gold)',marginBottom:18,display:'flex',alignItems:'center',gap:8}}><span style={{width:18,height:1.5,background:'var(--gold)',display:'block'}}/>Pricing</div>
          <h2 className="sr sr-d1" style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(36px,4vw,54px)',fontWeight:900,lineHeight:1.1,letterSpacing:'-1.5px',color:'var(--cream)',marginBottom:18}}>
            Simple. Honest.<br/><em style={{fontStyle:'italic',color:'var(--gold)'}}>Worth every cent.</em>
          </h2>
          {/* Toggle */}
          <div style={{display:'inline-flex',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:50,overflow:'hidden',marginTop:36,marginBottom:0}}>
            {(['monthly','annual'] as const).map(b=>(
              <button key={b} onClick={()=>setBilling(b)} style={{padding:'9px 22px',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .2s',color:billing===b?'var(--ink)':'rgba(245,240,232,.55)',border:'none',background:billing===b?'var(--cream)':'none',borderRadius:50,fontFamily:'DM Sans,sans-serif'}}>
                {b==='monthly'?'Monthly':'Annual'}{b==='annual'&&<span style={{background:'var(--gold)',color:'var(--ink)',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:8,marginLeft:5}}>–20%</span>}
              </button>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,maxWidth:860,margin:'48px auto 0'}}>
            {/* Starter */}
            <div style={{borderRadius:'var(--r-xl)',padding:'40px 36px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',transition:'transform .22s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-5px)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
              <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',opacity:.55,marginBottom:16}}>Starter Plan</div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:64,fontWeight:900,letterSpacing:'-2px',lineHeight:1,marginBottom:6}}>${billing==='annual'?prices.starter.a:prices.starter.m}</div>
              <div style={{fontSize:13,opacity:.45,marginBottom:24}}>per month · billed {billing}</div>
              <hr style={{border:'none',borderTop:'1px solid rgba(255,255,255,.08)',margin:'24px 0'}}/>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:11,marginBottom:32}}>
                {['100 posts/month','3 variations per generate','Voice DNA training','500+ hook library','Post Intelligence Score','5 languages (EN,DE,FR,ES,PT)','Post scheduler & streak','Unlimited post library'].map(f=>(
                  <li key={f} style={{display:'flex',alignItems:'flex-start',gap:10,fontSize:13,lineHeight:1.5}}><span style={{color:'rgba(245,240,232,.7)',flexShrink:0}}>✓</span>{f}</li>
                ))}
              </ul>
              <button onClick={()=>{setModal('signup')}} style={{display:'block',width:'100%',padding:14,textAlign:'center',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.1)',color:'var(--cream)',fontFamily:'DM Sans,sans-serif',transition:'all .2s'}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.18)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.1)'}>Start free trial →</button>
            </div>
            {/* Pro */}
            <div style={{borderRadius:'var(--r-xl)',padding:'40px 36px',background:'var(--cream)',color:'var(--ink)',boxShadow:'0 28px 72px rgba(0,0,0,.45)',position:'relative',transition:'transform .22s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-5px)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
              <div style={{position:'absolute',top:20,right:20,background:'var(--gold)',color:'var(--ink)',fontSize:10,fontWeight:700,padding:'4px 12px',borderRadius:20,textTransform:'uppercase',letterSpacing:'.08em'}}>Most Popular</div>
              <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',opacity:.55,marginBottom:16}}>Pro Global Plan</div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:64,fontWeight:900,letterSpacing:'-2px',lineHeight:1,marginBottom:6}}>${billing==='annual'?prices.pro.a:prices.pro.m}</div>
              <div style={{fontSize:13,opacity:.45,marginBottom:24}}>per month · billed {billing}</div>
              <hr style={{border:'none',borderTop:'1px solid var(--border)',margin:'24px 0'}}/>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:11,marginBottom:32}}>
                {['Unlimited posts','All 8 languages + Arabic RTL','50+ visual templates','Carousel builder','Comment Reply Generator','Profile Headline Rewriter','Weekly content brief','Priority support'].map(f=>(
                  <li key={f} style={{display:'flex',alignItems:'flex-start',gap:10,fontSize:13,lineHeight:1.5}}><span style={{color:'var(--blue)',flexShrink:0}}>✓</span><strong>{f}</strong></li>
                ))}
              </ul>
              <button onClick={()=>setModal('signup')} style={{display:'block',width:'100%',padding:14,textAlign:'center',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',border:'none',background:'var(--ink)',color:'var(--cream)',fontFamily:'DM Sans,sans-serif',transition:'all .2s'}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--blue)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--ink)'}>Start free trial →</button>
            </div>
          </div>
          {/* Top-up note */}
          <div style={{textAlign:'center',marginTop:32,padding:'20px 28px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'var(--r-lg)',maxWidth:600,margin:'32px auto 0'}}>
            <div style={{fontSize:14,fontWeight:700,color:'var(--gold)',marginBottom:6}}>💳 Hit your monthly limit? Just buy more.</div>
            <div style={{fontSize:13,color:'rgba(245,240,232,.55)'}}>Top-up credit packs: 10 posts for $5 · 25 posts for $10 · 50 posts for $18. Buy anytime inside the dashboard. No plan change needed.</div>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{background:'var(--ink)',color:'var(--cream)',textAlign:'center',padding:'96px 48px',position:'relative',zIndex:1}}>
        <h2 className="sr" style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(40px,5vw,70px)',fontWeight:900,letterSpacing:'-2px',lineHeight:1.1,marginBottom:20}}>Your audience is waiting.<br/><em style={{fontStyle:'italic',color:'var(--gold)'}}>Start posting today.</em></h2>
        <p style={{fontSize:18,opacity:.55,marginBottom:40}}>7-day free trial. No credit card required.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:28}}>
          <button onClick={()=>setModal('signup')} style={{background:'linear-gradient(135deg,var(--gold),var(--gold-light))',color:'var(--ink)',border:'none',padding:'14px 36px',borderRadius:50,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',boxShadow:'0 4px 20px rgba(201,168,76,.35)',transition:'all .2s'}}>Get started free →</button>
        </div>
        <p style={{fontSize:13,opacity:.35}}>✦ Join 12,000+ LinkedIn creators who sound human, not robotic</p>
      </div>

      {/* FOOTER */}
      <footer style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'28px 48px',borderTop:'1px solid var(--border)',position:'relative',zIndex:1}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:900}}>Linked<span style={{color:'var(--blue)'}}>Craft</span></div>
        <div style={{display:'flex',gap:24}}>{['Privacy','Terms','Blog','Contact'].map(l=><a key={l} href="#" style={{fontSize:13,color:'var(--muted)',textDecoration:'none'}}>{l}</a>)}</div>
        <div style={{fontSize:12,color:'var(--muted-light)'}}>© 2025 LinkedKraft · Write human. Post smart.</div>
      </footer>

      {/* AUTH MODAL */}
      {modal&&(
        <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{position:'absolute',inset:0,background:'rgba(13,13,13,.6)',backdropFilter:'blur(6px)'}} onClick={()=>{setModal(null);setErr('')}}/>
          <div style={{position:'relative',zIndex:1,background:'white',borderRadius:'var(--r-xl)',width:'100%',maxWidth:440,boxShadow:'var(--shadow-xl)',animation:'scaleIn .28s ease both'}}>
            <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(.94) translateY(10px)}to{opacity:1;transform:none}}`}</style>
            <button onClick={()=>{setModal(null);setErr('')}} style={{position:'absolute',top:16,right:16,width:32,height:32,border:'none',background:'var(--cream)',borderRadius:'50%',fontSize:15,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>✕</button>
            <div style={{textAlign:'center',padding:'36px 36px 0'}}>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:900,marginBottom:16}}>Linked<span style={{color:'var(--blue)'}}>Craft</span></div>
              <div style={{fontSize:22,fontWeight:800,letterSpacing:'-.5px',marginBottom:6}}>{modal==='signup'?'Create your account':'Welcome back'}</div>
              <div style={{fontSize:13,color:'var(--muted)'}}>{modal==='signup'?'7-day free trial · No credit card required':'Sign in to your LinkedKraft account'}</div>
            </div>
            <form onSubmit={handleAuth} style={{padding:'28px 36px 36px'}}>
              {err&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#991b1b',padding:'12px 16px',borderRadius:12,fontSize:13,marginBottom:16}}>{err}</div>}
              {modal==='signup'&&(
                <div style={{marginBottom:16}}>
                  <label style={{display:'block',fontSize:12,fontWeight:600,marginBottom:6}}>Full name</label>
                  <input value={name} onChange={e=>setName(e.target.value)} type="text" placeholder="Sarah Mitchell" required
                    style={{width:'100%',padding:'11px 14px',border:'1.5px solid var(--border-mid)',borderRadius:12,fontSize:14,fontFamily:'DM Sans,sans-serif',outline:'none',transition:'border-color .18s'}}
                    onFocus={e=>(e.target as HTMLElement).style.borderColor='var(--blue)'}
                    onBlur={e=>(e.target as HTMLElement).style.borderColor='var(--border-mid)'}/>
                </div>
              )}
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,marginBottom:6}}>Email</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="sarah@company.com" required
                  style={{width:'100%',padding:'11px 14px',border:'1.5px solid var(--border-mid)',borderRadius:12,fontSize:14,fontFamily:'DM Sans,sans-serif',outline:'none'}}
                  onFocus={e=>(e.target as HTMLElement).style.borderColor='var(--blue)'}
                  onBlur={e=>(e.target as HTMLElement).style.borderColor='var(--border-mid)'}/>
              </div>
              <div style={{marginBottom:20}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,marginBottom:6}}>Password</label>
                <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Min 8 characters" required minLength={8}
                  style={{width:'100%',padding:'11px 14px',border:'1.5px solid var(--border-mid)',borderRadius:12,fontSize:14,fontFamily:'DM Sans,sans-serif',outline:'none'}}
                  onFocus={e=>(e.target as HTMLElement).style.borderColor='var(--blue)'}
                  onBlur={e=>(e.target as HTMLElement).style.borderColor='var(--border-mid)'}/>
              </div>
              <button type="submit" disabled={loading} className={loading?'btn-loading':''}
                style={{width:'100%',padding:15,background:'var(--ink)',color:'var(--cream)',border:'none',borderRadius:50,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .2s'}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--blue)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--ink)'}>
                {modal==='signup'?'Start free trial →':'Sign in →'}
              </button>
              <div style={{textAlign:'center',fontSize:13,color:'var(--muted)',marginTop:18}}>
                {modal==='signup'?'Already have an account? ':'New to LinkedKraft? '}
                <a onClick={()=>{setModal(modal==='signup'?'login':'signup');setErr('')}} style={{color:'var(--blue)',fontWeight:600,cursor:'pointer'}}>
                  {modal==='signup'?'Sign in':'Create account'}
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
