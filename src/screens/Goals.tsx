'use client'
import { useResource } from '@/hooks/useResource'

type GoalsData = {
  goals: { name: string; current: string; target: string; pct: number; status: string; badge: string; trend: string; note: string; lowerIsBetter?: boolean }[]
  benchmarks: { kpi: string; industry: string; trinity: string; status: string }[]
  projections: { name: string; proj: string; target: string; on: boolean }[]
  projectedMonth: number
}

interface Goal {
  name: string
  current: string
  target: string
  pct: number
  status: 'green' | 'amber' | 'red'
  badge: string
  trend: 'up' | 'dn' | 'flat'
  note: string
  lowerIsBetter?: boolean
}

const barColor = (s: Goal['status']) =>
  s === 'green' ? 'var(--green-400)' : s === 'red' ? 'var(--red-400)' : 'var(--amber-400)'

const trendIcon = (t: Goal['trend']) => t === 'up' ? '<-' : t === 'dn' ? '' : '->'
const trendCls = (t: Goal['trend']) => t === 'up' ? 'up' : t === 'dn' ? 'dn' : ''

export default function Goals() {
  const { data, isLoading, error } = useResource<GoalsData>('goals')

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-2)' }}>Loading…</div>
  if (error) return <div className="p-8 text-center" style={{ color: 'var(--red-500)' }}>Error loading goals data</div>

  const GOALS = data?.goals ?? []
  const BENCHMARKS = data?.benchmarks ?? []
  const projMonth = data?.projectedMonth ?? 0

  const onTrack = GOALS.filter(g => g.status === 'green').length
  const aboveTarget = GOALS.filter(g => g.status === 'green').length
  const belowTarget = GOALS.filter(g => g.status === 'red').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div className="row">
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Goals &amp; Benchmarks</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>9 goals tracked  March 15, 2026 (MTD)  -  Trinity Dental Centers</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm">Edit Goals</button>
          <button className="btn btn-sm">Export Report</button>
        </div>
      </div>

      <div className="g4">
        <div className="metric"><div className="m-lbl">Goals On Track</div><div className="m-val" style={{ color: 'var(--green-600)' }}>6/9</div><div className="m-sub up">- +1 vs last month</div></div>
        <div className="metric"><div className="m-lbl">Above Target</div><div className="m-val">{aboveTarget}</div><div className="m-sub up">No-shows, A/R, Overhead</div></div>
        <div className="metric"><div className="m-lbl">Below Target</div><div className="m-val dn">{belowTarget}</div><div className="m-sub dn">Monthly Production</div></div>
        <div className="metric"><div className="m-lbl">Projected Month End</div><div className="m-val">${projMonth.toLocaleString()}</div><div className="m-sub up">- if pace holds</div></div>
      </div>

      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div>
            <div className="ai-title">AI Goal Coach</div>
            <div className="ai-sub">Prioritized recommendations  -  Mar 15, 2026</div>
          </div>
          <span className="badge bg" style={{ marginLeft: 'auto' }}>Live</span>
        </div>
        <div className="ai-item">
          <div className="ai-num">1</div>
          <div><strong>Recall rate is your biggest opportunity</strong>  closing the 13pp gap from 62% to 75% would add an estimated <strong>$8,200/month</strong> in hygiene production. Send batch recall outreach to 47 overdue patients today.</div>
        </div>
        <div className="ai-item">
          <div className="ai-num">2</div>
          <div><strong>Production at 67% with 15 days remaining</strong>  need $1,390/day to hit $64k goal. Dr. Patel&apos;s schedule has 3 open afternoon blocks. Filling them with recall patients = approx. $1,860 added.</div>
        </div>
        <div className="ai-item">
          <div className="ai-num">3</div>
          <div><strong>Collections rate 4pp below 92% target</strong>  follow up on 7 denied claims ($4,820) and 3 ERA batches pending posting ($2,840). Both are same-week fixes.</div>
        </div>
      </div>

      {/* Goal cards grid */}
      <div className="g3">
        {GOALS.map(g => (
          <div className="card" key={g.name}>
            <div className="row" style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{g.name}</span>
              <span className={`badge ${g.badge}`}>{g.status === 'green' ? (g.lowerIsBetter ? 'Met OK' : 'On Track') : g.status === 'red' ? 'Off Track' : 'At Risk'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)' }}>{g.current}</span>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>/ {g.target}</span>
            </div>
            <div className="pw" style={{ height: 8, marginBottom: 6 }}>
              <div style={{ width: `${Math.min(g.pct, 100)}%`, height: '100%', background: barColor(g.status as Goal['status']), borderRadius: 4 }} />
            </div>
            <div className="row">
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{g.note}</span>
              <span className={`m-sub ${trendCls(g.trend as Goal['trend'])}`} style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>{trendIcon(g.trend as Goal['trend'])}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              {g.lowerIsBetter ? 'Lower is better' : `${g.pct}% of target`}
            </div>
          </div>
        ))}
      </div>

      {/* Benchmark comparison */}
      <div className="card">
        <div className="card-h">
          <div className="sec-t">Industry Benchmark Comparison</div>
          <span className="badge bb">ADSO / MGMA Benchmarks 2025</span>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>KPI</th>
                <th>Industry Average</th>
                <th>Trinity Dental</th>
                <th>Status</th>
                <th>Gap / Surplus</th>
              </tr>
            </thead>
            <tbody>
              {BENCHMARKS.map(b => (
                <tr key={b.kpi}>
                  <td style={{ fontWeight: 600 }}>{b.kpi}</td>
                  <td style={{ color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{b.industry}</td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{b.trinity}</td>
                  <td><span className={`badge ${b.status}`}>{b.status === 'bg' ? 'Above Avg' : b.status === 'ba' ? 'Near Avg' : 'Below Avg'}</span></td>
                  <td style={{ fontSize: 12, color: b.status === 'br' ? 'var(--red-400)' : b.status === 'ba' ? 'var(--amber-400)' : 'var(--green-600)', fontWeight: 600 }}>
                    {b.status === 'bg' ? 'Outperforming' : b.status === 'ba' ? 'Close to target' : 'Needs attention'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="g2">
        {/* Off-track detail */}
        <div className="card">
          <div className="card-h">
            <div className="sec-t">Off-Track &amp; At-Risk Goals</div>
            <div className="row" style={{ gap: 6 }}>
              <span className="badge br">Off Track: {GOALS.filter(g => g.status === 'red').length}</span>
              <span className="badge ba">At Risk: {GOALS.filter(g => g.status === 'amber').length}</span>
            </div>
          </div>
          {GOALS.filter(g => g.status !== 'green').map(g => (
            <div key={g.name} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div className="row" style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{g.name}</span>
                <span className={`badge ${g.badge}`}>{g.pct}%</span>
              </div>
              <div className="pw" style={{ height: 6, marginBottom: 4 }}>
                <div style={{ width: `${Math.min(g.pct, 100)}%`, height: '100%', background: barColor(g.status as Goal['status']), borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                Current: <strong>{g.current}</strong> &nbsp; - &nbsp; Target: {g.target}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{g.note}</div>
            </div>
          ))}
        </div>

        {/* On-track celebration + projected */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h">
              <div className="sec-t">Goals Met / On Track</div>
              <span className="badge bg">Above Target</span>
            </div>
            {GOALS.filter(g => g.status === 'green').map(g => (
              <div key={g.name} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div className="row" style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{g.name}</span>
                  <span className="badge bg">OK</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                  Current: <strong>{g.current}</strong>  -  Target: {g.target}
                </div>
                <div style={{ fontSize: 11, color: 'var(--green-600)', marginTop: 2 }}>{g.note}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="sec-t" style={{ marginBottom: 14 }}>Month-End Projection</div>
            {(data?.projections ?? [
              { name: 'Production', proj: '$68,400', target: '$64,000', on: true },
              { name: 'Collections Rate', proj: '90%', target: '92%', on: false },
              { name: 'New Patients', proj: '28', target: '30', on: false },
              { name: 'Recall Rate', proj: '65%', target: '75%', on: false },
              { name: 'Accept Rate', proj: '75%', target: '80%', on: false },
            ]).map(r => (
              <div key={r.name} className="fin-r" style={{ paddingBottom: 8 }}>
                <span style={{ fontSize: 12 }}>{r.name}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: r.on ? 'var(--green-600)' : 'var(--amber-400)' }}>{r.proj}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>/ {r.target}</span>
                </div>
              </div>
            ))}
            <div className="alert al-i" style={{ marginTop: 12 }}>
              <span> -  - </span>
              <span>If current pace holds, production will finish <strong>$4,400 above target</strong>. Focus remaining capacity on recall and unaccepted treatment to unlock further upside.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
