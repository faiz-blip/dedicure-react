'use client'
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useAppointments } from '@/hooks/useAppointments'
import { useClaims } from '@/hooks/useClaims'
import { useRecall } from '@/hooks/useRecall'
import { useAI } from '@/hooks/useAI'
import { backendUrl } from '@/lib/config'

// ─── Static Mock Data (non-production) ────────────────────────────────────────
const MOCK_COACH = [
  { n: 1, msg: 'Call Carlos Mendez (713-555-0156) — 9-month recall overdue, previously a SRP candidate. Scheduling him = $620 + potential crown on #30. Best call window: before 10 AM.', rpa: 'Draft SMS' },
  { n: 2, msg: 'Fill 11 AM open slot on Chair 2 — 3 patients on your waitlist want this time. Linda Torres is #1 match (cleaning, 10 min drive away). One click to book.', rpa: 'Auto-Book' },
  { n: 3, msg: 'Refile Claim #4821 (Marcus Webb, $1,240) — Cigna denied D2750 for missing pre-op X-ray. Attach D0220 from Feb 12 and refile today. Filing deadline in 9 days.', rpa: 'Refile Claim' },
  { n: 4, msg: 'Order PPE supplies now — Nitrile Gloves (L) have 2 boxes remaining. At current usage you run out in 3 days. Patterson order ships same-day before noon.', rpa: 'Order Supplies' },
  { n: 5, msg: "Verify insurance for tomorrow's 9 patients — 4 of 9 have not been verified for benefits this year. Run eligibility batch now to prevent day-of surprises.", rpa: 'Verify All' },
]

const MOCK_SCHEDULE = [
  { id: 1, time: '8:00 AM', status: 'Arrived', cls: 'slot-g', color: 'var(--green-600)', patient: 'Sarah Johnson', detail: 'Cleaning · Dr. Patel · $180' },
  { id: 2, time: '9:30 AM', status: 'Confirmed', cls: 'slot-b', color: 'var(--blue-600)', patient: 'Marcus Webb', detail: 'Crown Prep #14 · Dr. Lee · $1,240' },
  { id: 3, time: '11:00 AM', status: 'OPEN SLOT', cls: 'slot-a', color: 'var(--amber-600)', patient: '← Fill from Waitlist', detail: 'Chair 2 · 60 min available' },
  { id: 4, time: '2:00 PM', status: 'Confirmed', cls: 'slot-b', color: 'var(--blue-600)', patient: 'Priya Nair', detail: 'New Patient Exam · Dr. Patel · $250' },
]

const MOCK_PROVIDERS = [
  { name: 'Dr. Patel', av: 'SP', cls: 'av-g', prod: 14820, goal: 18000 },
  { name: 'Dr. Lee', av: 'JL', cls: 'av-b', prod: 7898, goal: 16000 },
  { name: 'Maria R. (Hygiene)', av: 'MR', cls: 'av-a', prod: 3840, goal: 6000 },
]

const MOCK_OFFICES = [
  { name: 'Trinity Sealy', prod: '$22,718', pct: '35% to goal', up: false },
  { name: 'Main Office', prod: '$34,580', pct: '82% to goal', up: true },
  { name: 'North Campus', prod: '$38,240', pct: '83% to goal', up: true },
]

const DAILY_GOAL = 3200
const ALERT_TABS = ['all', 'clinical', 'billing', 'ops']

// ─── Open Dental Data Hooks ─────────────────────────────────────────────
const THROTTLE_MS = 5000

function useProviders() {
  const [providersMap, setProvidersMap] = useState({})
  
  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch(backendUrl('/api/od/providers'))
        if (res.ok) {
          const data = await res.json()
          const map = {}
          const colors = ['av-g', 'av-b', 'av-a', 'av-r', 'av-p', 'av-y']
          data.forEach((p, i) => {
            // OD data might have empty names, fallback to Abbr
            const fName = p.FName || ''
            const lName = p.LName || ''
            let name = `${fName} ${lName}`.trim()
            if (!name) name = p.Abbr || `Provider ${p.ProvNum}`
            
            // Build avatar initial
            let av = p.Abbr
            if (!av || av.length > 3) av = (fName[0] || '') + (lName[0] || '') || 'PR'
            
            map[p.ProvNum] = {
              name,
              av: av.substring(0, 2).toUpperCase(),
              cls: colors[i % colors.length],
              goal: p.FeeSched === 53 ? 18000 : 15000 // Fake goal based on generic data
            }
          })
          setProvidersMap(map)
        }
      } catch (e) {
        console.error('[DashboardReact] Failed to fetch providers:', e)
      }
    }
    fetchProviders()
  }, [])
  
  return providersMap
}

function useMonthlyProduction(year, month) {
  const [prodByDay,      setProdByDay]      = useState({})
  const [prodByProvider, setProdByProvider] = useState({})
  const [loading,        setLoading]        = useState(true)
  const [lastFetched,    setLastFetched]    = useState(null)
  const [source,         setSource]         = useState('loading')
  const fetchingRef = useRef(false)

  const fetchProduction = useCallback(async (force = false) => {
    if (!force && lastFetched && Date.now() - lastFetched < THROTTLE_MS) return
    if (fetchingRef.current) return
    fetchingRef.current = true
    setLoading(true)
    try {
      // Fetch live OD procedurelogs for the specific month
      const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const lastDay = new Date(year, month + 1, 0).getDate()
      const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      
      const res = await fetch(`/api/od/procedurelogs?dateStart=${monthStart}&dateEnd=${monthEnd}&t=${Date.now()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const procs = await res.json()
      
      const byDay = {}
      const byProv = {}
      
      // Even if no procs, we successfully fetched live data (it's just empty)
      if (Array.isArray(procs)) {
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
        for (const p of procs) {
          if (!p.ProcDate || !p.ProcDate.startsWith(monthStr)) continue
          
          const fee = Number(p.ProcFee || 0)
          
          // Aggregate by day
          const day = parseInt(p.ProcDate.substring(8, 10))
          if (!byDay[day]) byDay[day] = { actual: 0, scheduled: 0 }
          
          // Aggregate by provider
          const prov = p.ProvNum || 0
          if (!byProv[prov]) byProv[prov] = { actual: 0, scheduled: 0 }
          
          if (p.ProcStatus === 2 || p.ProcStatus === 'C') {
            byDay[day].actual += fee
            byProv[prov].actual += fee
          } else if (p.ProcStatus === 1 || p.ProcStatus === 'TP') {
            byDay[day].scheduled += fee
            byProv[prov].scheduled += fee
          }
        }
      }

      setProdByDay(byDay)
      setProdByProvider(byProv)
      setSource('live')
      setLastFetched(Date.now())
    } catch (e) {
      console.warn('[DashboardReact] OD fetch failed, showing empty data:', e)
      setProdByDay({})
      setProdByProvider({})
      setSource('error')
      setLastFetched(Date.now())
    } finally {
      fetchingRef.current = false
      setLoading(false)
    }
  }, [lastFetched, year, month])

  // Refetch when year/month changes or on mount
  useEffect(() => { 
    fetchProduction(true) 
  }, [year, month])

  return { prodByDay, prodByProvider, loading, lastFetched, source, refresh: () => fetchProduction(true) }
}

// ─── DSO Calendar ─────────────────────────────────────────────────────────────
function DsoCalendar({ year, month, dailyGoal, prodByDay, loading, lastFetched, onRefresh, onPrevMonth, onNextMonth, onToday, isCurrentMonth, selectedDay, onDaySelect }) {
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d
  }, [])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const monthLabel = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })
  const lastFetchedLabel = lastFetched
    ? new Date(lastFetched).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="card grow" style={{ flex: 2, padding: 0, overflow: 'hidden', background: '#f8f7f4', border: '1px solid rgba(0,0,0,.09)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 10px', borderBottom: '1px solid rgba(0,0,0,.07)', background: '#fff', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={onPrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: 14 }}>&lsaquo;</button>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', color: '#18180f', textTransform: 'uppercase', minWidth: 100, textAlign: 'center' }}>
              {monthLabel}
            </span>
            <button onClick={onNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: 14 }}>&rsaquo;</button>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: '#18180f', textTransform: 'uppercase' }}>
            — DSO Daily Production
          </span>
          {!isCurrentMonth && (
             <button onClick={onToday} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(0,0,0,.12)', background: '#fff', cursor: 'pointer', color: '#5a584f', marginLeft: 4 }}>Today</button>
          )}
          {loading && <span style={{ fontSize: 10, color: '#9A9890' }}>Loading from OD…</span>}
          {!loading && lastFetchedLabel && (
            <span style={{ fontSize: 10, color: '#9A9890' }}>Live · {lastFetchedLabel}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '3px 10px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d' }}>Daily Target: ${dailyGoal.toLocaleString()}</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#5a584f' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Actual ≥ goal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#5a584f' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} /> Below goal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#5a584f' }}>
            <span style={{ width: 6, height: 6, borderRadius: 1, background: '#6366f1', display: 'inline-block' }} /> Scheduled
          </span>
          <button
            onClick={onRefresh}
            style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(0,0,0,.12)', background: '#fff', cursor: 'pointer', color: '#5a584f' }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Day of week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: '#fff', borderBottom: '1px solid rgba(0,0,0,.07)' }}>
        {DOW.map((d) => (
          <div key={d} style={{ textAlign: 'center', padding: '5px 0', fontSize: 9, fontWeight: 700, letterSpacing: '.06em', color: '#9A9890', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, background: '#e5e3df' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} style={{ background: '#f2f0ec', minHeight: 72 }} />

          const date = new Date(year, month, day); date.setHours(0, 0, 0, 0)
          const isToday = date.getTime() === today.getTime()
          const isFuture = date > today
          const isWeekend = date.getDay() === 0 || date.getDay() === 6
          const { actual = 0, scheduled = 0 } = prodByDay[day] ?? {}
          const aboveGoal = actual >= dailyGoal
          const actualPct = actual > 0 ? Math.min((actual / dailyGoal) * 100, 100) : 0
          const scheduledPct = scheduled > 0 ? Math.min((scheduled / dailyGoal) * 100, 100) : 0
          const barColor = aboveGoal ? '#16a34a' : '#dc2626'
          const isClosed = !actual && !scheduled

          let bg = '#fff'
          if (isClosed) bg = '#f6f5f2'
          else if (isFuture && !scheduled) bg = '#fafaf8'

          const isSelected = day === selectedDay

          return (
            <div key={day} onClick={() => onDaySelect(day)} style={{ background: bg, minHeight: 72, padding: '7px 8px 10px', position: 'relative', cursor: 'pointer', boxShadow: isSelected ? 'inset 0 0 0 2px #0D6E4E' : isToday ? 'inset 0 0 0 2px #1A9E72' : undefined }}>
              {/* Day number */}
              {isToday ? (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#0D6E4E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, marginBottom: 3 }}>{day}</div>
              ) : (
                <div style={{ fontSize: 11, fontWeight: isClosed ? 400 : 500, color: isClosed ? '#B0AEA6' : '#18180F', marginBottom: 3 }}>{day}</div>
              )}

              {/* Actual production */}
              {actual > 0 && (
                <div style={{ fontSize: 10, fontWeight: 700, color: barColor, lineHeight: 1.2 }}>
                  ${(actual / 1000).toFixed(1)}k
                </div>
              )}

              {/* Scheduled production (future / partial days) */}
              {scheduled > 0 && (
                <div style={{ fontSize: 9, color: '#6366f1', fontWeight: 600, lineHeight: 1.2 }}>
                  +${(scheduled / 1000).toFixed(1)}k sched
                </div>
              )}

              {/* Goal gap / overage */}
              {actual > 0 && (
                <div style={{ fontSize: 8, color: barColor, opacity: 0.8, lineHeight: 1.2 }}>
                  {aboveGoal ? `+$${((actual - dailyGoal) / 1000).toFixed(1)}k` : `-$${((dailyGoal - actual) / 1000).toFixed(1)}k`}
                </div>
              )}

              {/* No data states */}
              {isClosed && !isWeekend && (
                <div style={{ fontSize: 9, color: '#D4D2CB' }}>Closed</div>
              )}

              {/* Bottom progress bars */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#e5e3df', display: 'flex', gap: 1 }}>
                {/* Actual bar */}
                {actualPct > 0 && (
                  <div style={{ width: `${actualPct}%`, height: '100%', background: barColor, transition: 'width .4s', borderRadius: '0 0 0 0' }} />
                )}
                {/* Scheduled bar — fills remaining space */}
                {scheduledPct > 0 && (
                  <div style={{ width: `${Math.min(scheduledPct, 100 - actualPct)}%`, height: '100%', background: '#6366f1', opacity: 0.6, transition: 'width .4s' }} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [alertTab, setAlertTab] = useState('all')

  const now = new Date()
  const [selectedDate, setSelectedDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()

  const { prodByDay, prodByProvider, loading, lastFetched, source, refresh } = useMonthlyProduction(year, month)
  const providersMap = useProviders()

  // Derive MTD aggregates from live data
  const mtdActual = Object.values(prodByDay).reduce((s, d) => s + (d.actual || 0), 0)
  const mtdScheduled = Object.values(prodByDay).reduce((s, d) => s + (d.scheduled || 0), 0)

  // Live hooks for AI Coach and Appointments
  const dateStr = now.toISOString()
  const todayStr = dateStr.split('T')[0]
  const firstOfMonthStr = todayStr.substring(0, 8) + '01'

  // Selected day within the calendar (defaults to today's day)
  const [selectedDay, setSelectedDay] = useState(() => now.getDate())
  useEffect(() => {
    setSelectedDay(year === now.getFullYear() && month === now.getMonth() ? now.getDate() : 1)
  }, [year, month])

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
  const selectedDateLabel = new Date(year, month, selectedDay).toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })

  const { appointments, isLoading: isLoadingApts } = useAppointments(selectedDateStr, selectedDateStr)
  const { claims } = useClaims()
  const { recalls } = useRecall()

  const collectionsMTD = claims?.filter(c => c.DateSent >= firstOfMonthStr && c.DateSent <= todayStr).reduce((sum, c) => sum + (c.InsPayAmt || 0), 0) ?? 19440
  const overdueRecalls = recalls?.length ?? 47

  const [coachItems, setCoachItems] = useState(MOCK_COACH)
  const [hasPromptedAI, setHasPromptedAI] = useState(false)
  const { generateContent, isLoading: isAILoading } = useAI()

  useEffect(() => {
    if (hasPromptedAI || isAILoading) return
    if (!appointments || !recalls || !claims) return // Wait for live data
    
    const fetchAiCoach = async () => {
      setHasPromptedAI(true)
      const prompt = `You are a dental office AI Production Coach. Based on the following live data from Open Dental, generate exactly 5 concise, highly actionable coaching items for today to increase production or office efficiency. 

Return ONLY a valid JSON array of objects, where each object has a "msg" (the suggestion text) and an "rpa" (a 2-3 word label for an automated action button related to the suggestion, e.g. "Run Eligibility", "Draft SMS", "Refile Claim"). Do NOT use markdown code blocks (\`\`\`json) or any other text before or after the array.

Data:
- Appointments today: ${appointments.length}
- MTD Production: $${mtdActual}
- MTD Collections: $${collectionsMTD}
- Overdue Recalls: ${overdueRecalls}
- Outstanding Claims: ${claims.filter(c => c.ClaimStatus === 'U').length}`

      const res = await generateContent(prompt)
      if (res) {
        try {
          const cleanRes = res.replace(/```json/gi, '').replace(/```/g, '').trim()
          const parsed = JSON.parse(cleanRes)
          if (Array.isArray(parsed)) {
            setCoachItems(parsed.map((item, i) => ({
              n: i + 1,
              msg: item.msg || item,
              rpa: item.rpa || 'Take Action'
            })))
          }
        } catch (e) {
          console.error("[Dashboard React] Failed to parse AI coach response", e, res)
          setCoachItems([{ n: 1, msg: 'Failed to generate AI insights.', rpa: 'Retry' }])
        }
      }
    }
    fetchAiCoach()
  }, [hasPromptedAI, isAILoading, appointments, recalls, claims, mtdActual, collectionsMTD, overdueRecalls, generateContent])

  const formatTime = (isoString) => {
    if (!isoString || isoString.startsWith('0001')) return ''
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const getSlotClass = (status) => {
    if (status === 'Arrived') return 'slot-g'
    if (status === 'Complete') return 'slot-p'
    return 'slot-b'
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const todayDay = now.getDate()
  // Only show "Today" metrics if viewing current month
  const todayActual = isCurrentMonth ? (prodByDay[todayDay]?.actual ?? 0) : 0
  const todayScheduled = isCurrentMonth ? (prodByDay[todayDay]?.scheduled ?? 0) : 0

  const handlePrevMonth = useCallback(() => {
    setSelectedDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }, [])
  const handleNextMonth = useCallback(() => {
    setSelectedDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }, [])
  const handleToday = useCallback(() => {
    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), 1))
  }, [now])

  const fmt = (n) => n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  const nowLabel = now.toLocaleString('default', { weekday: 'long', month: 'short', day: 'numeric' })
  const timeLabel = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <>
      {/* ── AI Coach ── */}
      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon">✦</div>
          <div>
            <div className="ai-title">AI Production Coach — Today's Action Plan</div>
            <div className="ai-sub">{nowLabel} · Based on your schedule, recall data &amp; production gaps</div>
          </div>
          <span className="badge bg" style={{ marginLeft: 'auto' }}>Updated {timeLabel}</span>
        </div>
        {coachItems.map(({ n, msg, rpa }) => (
          <div className="ai-item" key={n}>
            <div className="ai-num">{n}</div>
            <div style={{ flex: 1 }}>{msg}</div>
            {rpa && (
              <button style={{
                background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 4
              }}>
                <span style={{ fontSize: '12px', lineHeight: 1 }}>✦</span>
                {rpa}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── Metrics Row 1 — driven by live OD data ── */}
      <div className="g4">
        <div className="metric">
          <div className="m-lbl">Production MTD</div>
          <div className="m-val">{loading ? '…' : `$${fmt(mtdActual)}`}</div>
          <div className="m-sub dn">▼ 35% to $64k goal</div>
        </div>
        <div className="metric">
          <div className="m-lbl">Scheduled MTD</div>
          <div className="m-val" style={{ color: '#6366f1' }}>{loading ? '…' : `$${fmt(mtdScheduled)}`}</div>
          <div className="m-sub">treatment planned</div>
        </div>
        <div className="metric">
          <div className="m-lbl">Today's Actual</div>
          <div className="m-val">{loading ? '…' : `$${fmt(todayActual)}`}</div>
          <div className="m-sub">completed procedures</div>
        </div>
        <div className="metric">
          <div className="m-lbl">Today's Scheduled</div>
          <div className="m-val" style={{ color: '#6366f1' }}>{loading ? '…' : `$${fmt(todayScheduled)}`}</div>
          <div className="m-sub">of {fmt(DAILY_GOAL)} goal</div>
        </div>
      </div>

      {/* ── Metrics Row 2 ── */}
      <div className="g4">
        <div className="metric"><div className="m-lbl">New Patients MTD</div><div className="m-val">23</div><div className="m-sub up">▲ +5 vs last month</div></div>
        <div className="metric"><div className="m-lbl">Treatment Accept Rate</div><div className="m-val">74%</div><div className="m-sub up">▲ +3% vs avg</div></div>
        <div className="metric"><div className="m-lbl">Recall Rate</div><div className="m-val">62%</div><div className="m-sub dn">▼ target 75%</div></div>
        <div className="metric"><div className="m-lbl">Outstanding A/R</div><div className="m-val">$28,420</div><div className="m-sub dn">7 denied claims</div></div>
      </div>

      {/* ── DSO Calendar + Today's Schedule ── */}
      <div className="row">
        <DsoCalendar
          year={year}
          month={month}
          dailyGoal={DAILY_GOAL}
          prodByDay={prodByDay}
          loading={loading}
          lastFetched={lastFetched}
          onRefresh={refresh}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          isCurrentMonth={isCurrentMonth}
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
        />

        <div className="card fixed" style={{ width: 230 }}>
          <div className="card-h">
            <div className="sec-t">{selectedDateLabel}</div>
            <span className="badge ba">{appointments?.length ? `${appointments.length} appts` : '—'}</span>
          </div>

          {isLoadingApts ? (
            <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>Loading…</div>
          ) : appointments && appointments.length > 0 ? (
            appointments.slice(0, 5).map((apt) => (
              <div key={apt.AptNum} className={`slot ${getSlotClass(apt.AptStatus)}`}>
                <div style={{ fontSize: 9, opacity: 0.8 }}>
                  {formatTime(apt.AptDateTime)} · {apt.AptStatus}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  <Link href={`/patients/${apt.PatNum}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
                      {apt.PatientName || `Patient #${apt.PatNum}`}
                    </span>
                  </Link>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {apt.Note || 'Routine Visit'} · Prov {apt.ProvNum}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>
              No appointments scheduled.
            </div>
          )}
          <div className="slot slot-r">
            <div style={{ fontSize: 9, color: 'var(--red-600)' }}>Recall Alert</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>47 Patients Overdue</div>
            <div style={{ fontSize: 10, color: 'var(--text2)' }}>$16,450 in opportunity</div>
          </div>
        </div>
      </div>

      {/* ── Alerts + Provider Production ── */}
      <div className="row">
        <div className="card grow">
          <div className="card-h">
            <div className="sec-t">Alerts &amp; Actions</div>
            <div className="subtabs">
              {ALERT_TABS.map((tab) => (
                <div key={tab} className={`stab${alertTab === tab ? ' active' : ''}`} onClick={() => setAlertTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>
          </div>
          {(alertTab === 'all' || alertTab === 'billing') && (
            <div className="alert al-d"><span>⊗</span><span><strong>Claim #4821 denied ($1,240)</strong> — Cigna rejected D2750 for missing pre-op X-ray. Attach D0220 from Feb 12 and refile. Deadline in 9 days. <a href="/billing" style={{ textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}>Fix now →</a></span></div>
          )}
          {(alertTab === 'all' || alertTab === 'clinical') && (
            <div className="alert al-w"><span>⚠</span><span><strong>47 patients overdue for recall</strong> — $16,450 revenue opportunity. Last batch outreach: Feb 28. <a href="/recall" style={{ textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}>Send batch →</a></span></div>
          )}
          {(alertTab === 'all' || alertTab === 'ops') && (
            <>
              <div className="alert al-w"><span>▽</span><span><strong>Gloves (L) &amp; Prophy Paste below reorder</strong> — 3 days of supply remaining. Patterson cutoff: noon today. <a href="/inventory" style={{ textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}>Order now →</a></span></div>
              <div className="alert al-i"><span>◷</span><span><strong>4 patients tomorrow not yet verified</strong> — Run eligibility check to prevent day-of denials. <a href="/eligibility" style={{ textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}>Verify now →</a></span></div>
            </>
          )}
          {alertTab === 'all' && (
            <div className="alert al-s"><span>★</span><span><strong>3 new Google reviews this week</strong> — Avg 4.8★. Linda Foster left a 5-star review. Reply to maintain ranking.</span></div>
          )}
        </div>

        <div className="card fixed" style={{ width: 260 }}>
          <div className="card-h"><div className="sec-t">Provider Production</div></div>
          {Object.entries(prodByProvider)
            .filter(([_, data]) => data.actual > 0)
            .sort((a,b) => b[1].actual - a[1].actual)
            .slice(0, 5) // Display top 5 providers max
            .map(([provNum, data]) => {
              const pInfo = providersMap[provNum] || { name: `Provider ${provNum}`, av: 'PR', goal: 15000, cls: 'av-g' }
              const pct = Math.round((data.actual / pInfo.goal) * 100)
              const pfCls = pct >= 75 ? 'pf-g' : pct >= 50 ? 'pf-a' : 'pf-r'
              return (
                <div key={provNum} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className={`av ${pInfo.cls}`}>{pInfo.av}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <Link href={`/providers/${provNum}`} style={{ fontSize: 11, fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>
                        <span style={{ cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
                          {pInfo.name}
                        </span>
                      </Link>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>${(data.actual / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="pw" style={{ height: 5 }}>
                      <div className={`pf ${pfCls}`} style={{ width: `${Math.min(pct, 100)}%`, height: '100%' }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{pct}% of ${(pInfo.goal / 1000).toFixed(0)}k goal</div>
                  </div>
                </div>
              )
          })}
          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 8 }}><div className="sec-t">Office Comparison MTD</div></div>
          {/* Dynamically calculated Trinity Sealy office */}
          <div className="fin-r">
            <span style={{ fontSize: 11 }}>Trinity Sealy</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>${(mtdActual / 1000).toFixed(1)}k</div>
              <div style={{ fontSize: 9, color: 'var(--green-400)' }}>Active</div>
            </div>
          </div>
          {/* Static placeholders for other offices without live OD connections yet */}
          <div className="fin-r">
            <span style={{ fontSize: 11 }}>Main Office</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>$34.5k</div>
              <div style={{ fontSize: 9, color: 'var(--green-400)' }}>82% to goal</div>
            </div>
          </div>
          <div className="fin-r">
            <span style={{ fontSize: 11 }}>North Campus</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>$38.2k</div>
              <div style={{ fontSize: 9, color: 'var(--green-400)' }}>83% to goal</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

