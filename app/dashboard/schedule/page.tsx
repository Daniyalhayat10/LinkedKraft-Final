'use client'
import { useState, useEffect } from 'react'
import { addDays, startOfWeek, format, isSameDay } from 'date-fns'
import toast from 'react-hot-toast'

const OPTIMAL_TIMES = ['7:00 AM','8:30 AM','12:00 PM','5:30 PM','7:00 PM']

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [scheduled, setScheduled] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/save-post').then(r => r.json()).then(d => setSavedPosts(d.posts || []))
  }, [])

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  const getPostsForDay = (day: Date) => scheduled.filter(s => isSameDay(new Date(s.date), day))

  const schedulePost = (post: any, day: Date, time: string) => {
    setScheduled(prev => [...prev, { ...post, date: day, time, id: `${post.id}-${day.toISOString()}-${time}` }])
    toast.success(`Scheduled for ${format(day, 'MMM d')} at ${time}`)
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px', marginBottom: 4 }}>Schedule</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Plan your week. Post at optimal times.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setWeekStart(addDays(weekStart, -7))} style={navBtn}>← Prev</button>
          <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} style={{ ...navBtn, background: 'var(--blue)', color: 'white', border: 'none' }}>Today</button>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} style={navBtn}>Next →</button>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 12 }}>
        {format(weekStart, 'MMMM d')} – {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
      </div>

      {/* Week grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10, marginBottom: 28 }}>
        {days.map(day => {
          const isToday = isSameDay(day, today)
          const isPast = day < today && !isToday
          const dayPosts = getPostsForDay(day)
          return (
            <div key={day.toISOString()} style={{ background: 'white', border: `2px solid ${isToday ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', overflow: 'hidden', minHeight: 160, opacity: isPast ? .6 : 1 }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', background: isToday ? 'var(--blue)' : 'transparent' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: isToday ? 'rgba(255,255,255,.7)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{format(day, 'EEE')}</div>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 900, color: isToday ? 'white' : 'var(--ink)' }}>{format(day, 'd')}</div>
              </div>
              <div style={{ padding: 8 }}>
                {dayPosts.map(p => (
                  <div key={p.id} style={{ background: 'var(--blue-light)', borderRadius: 6, padding: '5px 7px', marginBottom: 5, fontSize: 10, fontWeight: 600, color: 'var(--blue)', lineHeight: 1.4 }}>
                    {p.time} · {p.topic?.substring(0, 24)}...
                  </div>
                ))}
                {dayPosts.length === 0 && !isPast && (
                  <div style={{ fontSize: 11, color: 'var(--muted-light)', textAlign: 'center', marginTop: 12 }}>
                    {isToday ? 'Post today!' : 'Empty'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Saved posts to schedule */}
      {savedPosts.length > 0 && (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '22px 24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Posts Ready to Schedule</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Drag or select a post and assign it to a day and optimal time.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {savedPosts.slice(0, 6).map(p => (
              <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '12px 14px', background: 'var(--cream-card)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.topic}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {OPTIMAL_TIMES.slice(0, 3).map(time => (
                    <button key={time} onClick={() => schedulePost(p, addDays(weekStart, Math.floor(Math.random() * 5) + 1), time)}
                      style={{ padding: '4px 9px', background: 'white', border: '1px solid var(--border)', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer', color: 'var(--blue)', fontFamily: 'DM Sans,sans-serif' }}>
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--blue-light)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--blue)' }}>
            💡 Optimal posting times: Tuesday–Thursday 8:30am, 12pm, and 5:30pm get the highest engagement for most audiences.
          </div>
        </div>
      )}
    </div>
  )
}

const navBtn: React.CSSProperties = { padding: '9px 16px', background: 'white', border: '1px solid var(--border-mid)', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }
