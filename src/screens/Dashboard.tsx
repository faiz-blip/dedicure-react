'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useAppointments } from '@/hooks/useAppointments'
import { useProcedures } from '@/hooks/useProcedures'
import { useResource } from '@/hooks/useResource'
import { useClaims } from '@/hooks/useClaims'
import { useRecall } from '@/hooks/useRecall'
import { useProviders } from '@/hooks/useProviders'
import { useAI } from '@/hooks/useAI'

// ─── Types ───────────────────────────────────────────────────────────────────
type DashData = {
  providers: { name: string; prod: number; goal: number; av: string; cls: string }[]
  dailyProduction: Record<number, number>
  dailyGoal: number
  calYear: number
  calMonth: number // 0-indexed
  offices: { name: string; prod: string; pct: string; up: boolean }[]
  coachItems: { n: number; msg: string }[]
}

// ─── DSO Calendar ────────────────────────────────────────────────────────────
function DsoCalendar({
  year,
  month,
  dailyGoal,
  production,
}: {
  year: number
  month: number
  dailyGoal: number
  production: Record<number, number>
}) {
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div
      className="card grow"
      style={{
        flex: 2,
        padding: 0,
        overflow: 'hidden',
        background: '#f8f7f4',
        border: '1px solid rgba(0,0,0,.09)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '13px 16px 10px',
          borderBottom: '1px solid rgba(0,0,0,.07)',
          background: '#fff',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '.06em',
            color: '#18180f',
            textTransform: 'uppercase',
          }}
        >
          {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })} —
          DSO Daily Production
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 6,
              padding: '3px 10px',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d' }}>
              Daily Target: ${dailyGoal.toLocaleString()}
            </span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#5a584f' }}>
            <span
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}
            />
            At or above target
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#5a584f' }}>
            <span
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }}
            />
            Below target
          </span>
        </div>
      </div>

      {/* Day of week headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          background: '#fff',
          borderBottom: '1px solid rgba(0,0,0,.07)',
        }}
      >
        {DOW.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              padding: '6px 0',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '.06em',
              color: '#9A9890',
              textTransform: 'uppercase',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          background: '#e5e3df',
        }}
      >
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} style={{ background: '#f2f0ec', minHeight: 68 }} />
          }
          const date = new Date(year, month, day)
          date.setHours(0, 0, 0, 0)
          const isToday = date.getTime() === today.getTime()
          const isFuture = date > today
          const isWeekend = date.getDay() === 0 || date.getDay() === 6
          const prod = production[day] ?? 0
          const aboveGoal = prod >= dailyGoal
          const pct = prod > 0 ? Math.min((prod / dailyGoal) * 100, 100) : 0
          const barColor = aboveGoal ? '#16a34a' : '#dc2626'

          let bg = '#fff'
          if (isWeekend && !prod) bg = '#f6f5f2'
          if (isFuture) bg = '#fafaf8'

          return (
            <div
              key={day}
              style={{
                background: bg,
                minHeight: 68,
                padding: '8px 9px',
                position: 'relative',
                boxShadow: isToday ? 'inset 0 0 0 2px #1A9E72' : undefined,
              }}
            >
              {/* Day number */}
              {isToday ? (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#0D6E4E',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {day}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: isWeekend ? 400 : 500,
                    color: isWeekend ? '#9A9890' : '#18180F',
                  }}
                >
                  {day}
                </div>
              )}

              {/* Production value */}
              {prod > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, color: barColor, marginTop: 5 }}>
                    ${(prod / 1000).toFixed(1)}k
                  </div>
                  <div style={{ fontSize: 8, color: barColor, opacity: 0.85 }}>
                    {aboveGoal ? '✓ above goal' : `-$${((dailyGoal - prod) / 1000).toFixed(1)}k`}
                  </div>
                  {/* Progress bar at bottom */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: '#e5e3df',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: barColor,
                        transition: 'width .4s',
                      }}
                    />
                  </div>
                </>
              )}

              {/* Future / no data */}
              {!prod && !isFuture && !isWeekend && (
                <div style={{ fontSize: 9, color: '#D4D2CB', marginTop: 4 }}>No data</div>
              )}
              {isFuture && !isWeekend && (
                <div style={{ fontSize: 9, color: '#D4D2CB', marginTop: 4 }}>—</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data, isLoading: dashLoading } = useResource('dashboard') as {
    data: DashData | undefined
    isLoading: boolean
  }

  const [alertTab, setAlertTab] = useState<'all' | 'clinical' | 'billing' | 'ops'>('all')

  const PROVIDERS = data?.providers ?? []
  const DAILY_GOAL = data?.dailyGoal ?? 3200
  const CAL_YEAR = data?.calYear ?? 2026
  const CAL_MONTH = data?.calMonth ?? 2 // March
  const DAILY_PROD = data?.dailyProduction ?? {
    2: 4120, 3: 3840, 4: 2180, 5: 3920, 6: 1840,
    9: 4280, 10: 3960, 11: 2840, 12: 4120, 13: 3760,
    16: 2840,
  }
  const [coachItems, setCoachItems] = useState<{ n: number; msg: string }[]>(data?.coachItems ?? [
    { n: 1, msg: 'Loading AI insights...' }
  ])
  const [hasPromptedAI, setHasPromptedAI] = useState(false)
  const { generateContent, isLoading: isAILoading } = useAI()
  const offices = data?.offices ?? [
    { name: 'Trinity Sealy', prod: '$22,718', pct: '35% to goal', up: false },
    { name: 'Main Office', prod: '$34,580', pct: '82% to goal', up: true },
    { name: 'North Campus', prod: '$38,240', pct: '83% to goal', up: true },
  ]

  // ── Live data ──
  const dateStr = new Date().toISOString()
  const todayStr = dateStr.split('T')[0]
  const firstOfMonthStr = todayStr.substring(0, 8) + '01'

  const { appointments, isLoading } = useAppointments(todayStr, todayStr)
  const { appointments: mtdApts } = useAppointments(firstOfMonthStr, todayStr)
  const { procedures } = useProcedures(undefined, firstOfMonthStr, todayStr)
  const { claims } = useClaims()
  const { recalls } = useRecall()
  const { providers } = useProviders()

  const prodByProvider = useMemo(() => {
    const byProv: Record<number, number> = {}
    if (!procedures) return byProv
    for (const p of procedures) {
      if (p.ProcStatus === 2 && p.ProcDate >= firstOfMonthStr && p.ProcDate <= todayStr) {
        byProv[p.ProvNum] = (byProv[p.ProvNum] || 0) + (p.ProcFee || 0)
      }
    }
    return byProv
  }, [procedures, firstOfMonthStr, todayStr])

  const productionMTD =
    procedures
      ?.filter((p) => p.ProcStatus === 2 && p.ProcDate >= firstOfMonthStr && p.ProcDate <= todayStr)
      .reduce((sum, p) => sum + (p.ProcFee || 0), 0) ?? 22718
  const collectionsMTD =
    claims
      ?.filter((c) => c.DateSent >= firstOfMonthStr && c.DateSent <= todayStr)
      .reduce((sum, c) => sum + (c.InsPayAmt || 0), 0) ?? 19440
  const patientsSeenMTD = mtdApts?.filter((a) => a.AptStatus === 'Complete').length ?? 142
  const todayProcs =
    procedures
      ?.filter((p) => p.ProcStatus === 2 && p.ProcDate === todayStr)
      .reduce((sum, p) => sum + (p.ProcFee || 0), 0) ?? 2840
  const todaySched =
    procedures
      ?.filter((p) => p.ProcDate === todayStr)
      .reduce((sum, p) => sum + (p.ProcFee || 0), 0) ?? 4820

  const overdueRecalls = recalls?.length ?? 47
  const recallRevenue = overdueRecalls * 350

  useEffect(() => {
    if (hasPromptedAI || isAILoading) return
    if (!appointments || !procedures || !recalls || !claims) return // Wait for live data to resolve
    
    const fetchAiCoach = async () => {
      setHasPromptedAI(true)
      const prompt = `You are a dental office AI Production Coach. Based on the following live data from Open Dental, generate exactly 5 concise, highly actionable coaching items for today to increase production or office efficiency. 

Return ONLY a valid JSON array of strings (e.g. ["Call John...", "Refile claim..."]). Do NOT use markdown code blocks (\`\`\`json) or any other text before or after the array.

Data:
- Appointments today: ${appointments.length}
- MTD Production: $${productionMTD}
- MTD Collections: $${collectionsMTD}
- Overdue Recalls: ${overdueRecalls}
- Outstanding Claims: ${claims.filter(c => c.ClaimStatus === 'U').length}`

      const res = await generateContent(prompt)
      if (res) {
        try {
          // Attempt to strip out any markdown code blocks the AI might have accidentally added
          const cleanRes = res.replace(/```json/gi, '').replace(/```/g, '').trim()
          const parsed = JSON.parse(cleanRes)
          if (Array.isArray(parsed)) {
            setCoachItems(parsed.map((msg, i) => ({ n: i + 1, msg })))
          }
        } catch (e) {
          console.error("[Dashboard] Failed to parse AI coach response", e, res)
          setCoachItems([{ n: 1, msg: 'Failed to generate AI insights. Check console for details.' }])
        }
      }
    }
    fetchAiCoach()
  }, [hasPromptedAI, isAILoading, appointments, procedures, recalls, claims, productionMTD, collectionsMTD, overdueRecalls, generateContent])


  const formatTime = (isoString: string) => {
    if (!isoString || isoString.startsWith('0001')) return ''
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  const getSlotClass = (status: string) => {
    switch (status) {
      case 'Complete': return 'slot-g'
      case 'Scheduled': return 'slot-b'
      case 'Broken': return 'slot-r'
      default: return 'slot-a'
    }
  }

  if (dashLoading) return <div className="p-8 text-center" style={{ color: 'var(--text2)' }}>Loading…</div>

  return (
    <>
      {/* ── AI Coach Panel ── */}
      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon">✦</div>
          <div>
            <div className="ai-title">AI Production Coach — Today&apos;s Action Plan</div>
            <div className="ai-sub">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} ·
              Based on your schedule, recall data &amp; production gaps
            </div>
          </div>
          <span className="badge bg" style={{ marginLeft: 'auto' }}>
            Updated {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        {coachItems.map(({ n, msg }) => (
          <div className="ai-item" key={n}>
            <div className="ai-num">{n}</div>
            <div>{msg}</div>
          </div>
        ))}
      </div>

      {/* ── Metrics Row 1 ── */}
      <div className="g4">
        <div className="metric">
          <div className="m-lbl">Production MTD</div>
          <div className="m-val">${productionMTD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="m-sub dn">▼ 35% to $64k goal</div>
        </div>
        <div className="metric">
          <div className="m-lbl">Collections MTD</div>
          <div className="m-val">${collectionsMTD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="m-sub up">▲ 88.5% rate</div>
        </div>
        <div className="metric">
          <div className="m-lbl">Patients Seen MTD</div>
          <div className="m-val">{patientsSeenMTD}</div>
          <div className="m-sub up">▲ +12 vs last month</div>
        </div>
        <div className="metric">
          <div className="m-lbl">Today&apos;s Production</div>
          <div className="m-val">${todayProcs.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="m-sub">of ${todaySched.toLocaleString(undefined, { maximumFractionDigits: 0 })} scheduled</div>
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
          year={CAL_YEAR}
          month={CAL_MONTH}
          dailyGoal={DAILY_GOAL}
          production={DAILY_PROD}
        />

        <div className="card fixed" style={{ width: 230 }}>
          <div className="card-h">
            <div className="sec-t">Today&apos;s Schedule</div>
            <span className="badge ba">{appointments?.length ? `${appointments.length} appts` : '3 open'}</span>
          </div>

          {isLoading ? (
            <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>Loading…</div>
          ) : appointments && appointments.length > 0 ? (
            appointments.slice(0, 5).map((apt) => (
              <div key={apt.AptNum} className={`slot ${getSlotClass(apt.AptStatus)}`}>
                <div style={{ fontSize: 9, opacity: 0.8 }}>
                  {formatTime(apt.AptDateTime)} · {apt.AptStatus}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {apt.PatientName || `Patient #${apt.PatNum}`}
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
            <div style={{ fontSize: 12, fontWeight: 600 }}>{overdueRecalls} Patients Overdue</div>
            <div style={{ fontSize: 10, color: 'var(--text2)' }}>${recallRevenue.toLocaleString()} in opportunity</div>
          </div>
        </div>
      </div>

      {/* ── Alerts & Actions + Provider Production ── */}
      <div className="row">
        <div className="card grow">
          <div className="card-h">
            <div className="sec-t">Alerts &amp; Actions</div>
            <div className="subtabs">
              {(['all', 'clinical', 'billing', 'ops'] as const).map((tab) => (
                <div
                  key={tab}
                  className={`stab${alertTab === tab ? ' active' : ''}`}
                  onClick={() => setAlertTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>
          </div>
          {(alertTab === 'all' || alertTab === 'billing') && (
            <div className="alert al-d">
              <span>⊗</span>
              <span>
                <strong>Claim #4821 denied ($1,240)</strong> — Cigna rejected D2750 for missing pre-op X-ray.
                Attach D0220 from Feb 12 and refile. Deadline in 9 days.{' '}
                <Link href="/billing" style={{ textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}>
                  Fix now →
                </Link>
              </span>
            </div>
          )}
          {(alertTab === 'all' || alertTab === 'clinical') && (
            <div className="alert al-w">
              <span>⚠</span>
              <span>
                <strong>{overdueRecalls} patients overdue for recall</strong> — ${recallRevenue.toLocaleString()} revenue
                opportunity. Last batch outreach: Feb 28.{' '}
                <Link href="/recall" style={{ textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}>
                  Send batch →
                </Link>
              </span>
            </div>
          )}
          {(alertTab === 'all' || alertTab === 'ops') && (
            <>
              <div className="alert al-w">
                <span>▽</span>
                <span>
                  <strong>Gloves (L) &amp; Prophy Paste below reorder</strong> — 3 days of supply remaining.
                  Patterson cutoff: noon today.{' '}
                  <Link href="/inventory" style={{ textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}>
                    Order now →
                  </Link>
                </span>
              </div>
              <div className="alert al-i">
                <span>◷</span>
                <span>
                  <strong>4 patients tomorrow not yet verified</strong> — Run eligibility check to prevent day-of
                  denials.{' '}
                  <Link href="/eligibility" style={{ textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}>
                    Verify now →
                  </Link>
                </span>
              </div>
            </>
          )}
          {(alertTab === 'all') && (
            <div className="alert al-s">
              <span>★</span>
              <span>
                <strong>3 new Google reviews this week</strong> — Avg 4.8★. Linda Foster left a 5-star review.
                Reply to maintain ranking.
              </span>
            </div>
          )}
        </div>

        {/* Provider Production */}
        <div className="card fixed" style={{ width: 260 }}>
          <div className="card-h"><div className="sec-t">Provider Production</div></div>
          {Object.entries(prodByProvider)
            .filter(([_, actual]) => actual > 0)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 5)
            .map(([provNumStr, actual]) => {
              const provNum = parseInt(provNumStr)
              const pInfo = providers?.find((p) => p.ProvNum === provNum)
              
              const colors = ['av-g', 'av-b', 'av-a', 'av-r', 'av-p', 'av-y']
              const cls = colors[provNum % colors.length]
              let name = pInfo ? `${pInfo.FName || ''} ${pInfo.LName || ''}`.trim() : `Provider ${provNum}`
              if (!name && pInfo) name = pInfo.Abbr || `Provider ${provNum}`
              
              let av = pInfo?.Abbr
              if (!av || av.length > 3) av = (pInfo?.FName?.[0] || '') + (pInfo?.LName?.[0] || '') || 'PR'
              av = av.substring(0, 2).toUpperCase()
              
              const goal = 15000 // Fake generic goal
              const pct = Math.round((actual / goal) * 100)
              
              return (
                <div
                  key={provNum}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)' }}
                >
                  <div className={`av ${cls}`}>{av}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>${(actual / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="pw" style={{ height: 5 }}>
                      <div
                        className={`pf ${pct >= 75 ? 'pf-g' : pct >= 50 ? 'pf-a' : 'pf-r'}`}
                        style={{ width: `${Math.min(pct, 100)}%`, height: '100%' }}
                      />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>
                      {pct}% of ${(goal / 1000).toFixed(0)}k goal
                    </div>
                  </div>
                </div>
              )
            })}
          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 8 }}><div className="sec-t">Office Comparison MTD</div></div>
          {offices.map((o) => (
            <div key={o.name} className="fin-r">
              <span style={{ fontSize: 11 }}>{o.name}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{o.prod}</div>
                <div style={{ fontSize: 9, color: o.up ? 'var(--green-400)' : 'var(--red-400)' }}>{o.pct}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
