'use client'
import { useState } from 'react'
import { useResource } from '@/hooks/useResource'

type AnalyticsData = {
  months: string[]
  prod2025: number[]
  prod2026: number[]
  providers: { name: string; av: string; cls: string; prod: number; cases: number; accept: number; office: string }[]
  offices: { name: string; prod: number; goal: number; patients: number; newPt: number; colRate: string; vs: string }[]
  kpis: [string, string, string, string, boolean][]
  acceptance: { proc: string; code: string; pct: number; color: string }[]
}

const MAX_BAR = 68000

const TABS = ['Production','Collections','Patients','Treatment','Overhead']

export default function Analytics() {
  const [tab, setTab] = useState(0)
  const { data, isLoading } = useResource('analytics') as { data: AnalyticsData | undefined, isLoading: boolean }

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div className="row">
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Business Analytics</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>YTD  -  All Offices  -  2026 vs 2025 comparison  Trinity Dental Centers</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm">Export CSV</button>
          <button className="btn btn-sm">Export PDF</button>
          <button className="btn btn-sm btn-p">+ Custom Report</button>
        </div>
      </div>

      <div className="g4">
        <div className="metric"><div className="m-lbl">Total Production YTD</div><div className="m-val">$284,200</div><div className="m-sub up">- +12% vs 2025</div></div>
        <div className="metric"><div className="m-lbl">Collections Rate</div><div className="m-val">88.4%</div><div className="m-sub up">- +3.0pp vs 2025</div></div>
        <div className="metric"><div className="m-lbl">New Patients YTD</div><div className="m-val">187</div><div className="m-sub up">- +24 vs 2025 pace</div></div>
        <div className="metric"><div className="m-lbl">Treatment Accept Rate</div><div className="m-val">74%</div><div className="m-sub up">- +4pp vs 2025</div></div>
      </div>

      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div>
            <div className="ai-title">AI Analytics Insight  YTD Performance</div>
            <div className="ai-sub">Generated Mar 15, 2026  -  Based on all 3 offices</div>
          </div>
          <span className="badge bg" style={{ marginLeft: 'auto' }}>Live</span>
        </div>
        <div className="ai-item">
          <div className="ai-num">*</div>
          <div>
            Production is up <strong>12% vs 2025</strong>. North Campus is outperforming all locations at <strong>+22% year-over-year</strong>. Recommend replicating Dr. Patel&apos;s case presentation approach across all providers  his 78% acceptance rate is 7 points above the group average and correlates with a <strong>$340 higher average case value</strong>. Recall rate at 62% vs 75% target represents the largest revenue opportunity: closing that gap would yield an estimated $8,200/month in additional hygiene production.
          </div>
        </div>
      </div>

      {/* Monthly production trend */}
      <div className="card">
        <div className="card-h">
          <div className="sec-t">Monthly Production  2026 vs 2025</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 11, color: 'var(--text2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: 'var(--border)', borderRadius: 2, display: 'inline-block' }} />2025
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: 'var(--green-400)', borderRadius: 2, display: 'inline-block' }} />2026
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(data?.months ?? []).map((mo, i) => {
            const v25 = (data?.prod2025 ?? [])[i]
            const v26 = (data?.prod2026 ?? [])[i]
            const w25 = Math.round((v25 / MAX_BAR) * 100)
            const w26 = v26 ? Math.round((v26 / MAX_BAR) * 100) : 0
            const ahead = v26 > v25
            const isMTD = i === 2
            return (
              <div key={mo} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', flexShrink: 0 }}>
                  {mo}{isMTD ? '*' : ''}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div className="pw" style={{ height: 7 }}>
                    <div style={{ width: `${w25}%`, height: '100%', background: 'var(--border)', borderRadius: 3 }} />
                  </div>
                  {(v26 > 0) && (
                    <div className="pw" style={{ height: 7 }}>
                      <div style={{ width: `${w26}%`, height: '100%', background: ahead ? 'var(--green-400)' : 'var(--amber-400)', borderRadius: 3 }} />
                    </div>
                  )}
                </div>
                <div style={{ width: 54, textAlign: 'right', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', flexShrink: 0 }}>
                  ${(v25/1000).toFixed(0)}k
                </div>
                {v26 > 0 ? (
                  <>
                    <div style={{ width: 54, textAlign: 'right', fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', color: ahead ? 'var(--green-400)' : 'var(--amber-400)', flexShrink: 0 }}>
                      ${(v26/1000).toFixed(0)}k
                    </div>
                    <span className={`badge ${ahead ? 'bg' : 'ba'}`} style={{ fontSize: 9, width: 44, justifyContent: 'center', flexShrink: 0 }}>
                      {ahead ? '+' : ''}{Math.round(((v26 - v25) / v25) * 100)}%
                    </span>
                  </>
                ) : (
                  <div style={{ width: 102, flexShrink: 0 }} />
                )}
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>* MTD as of March 15</div>
      </div>

      <div className="g2">
        {/* Provider comparison */}
        <div className="card">
          <div className="card-h">
            <div className="sec-t">Provider Comparison  YTD 2026</div>
            <span className="badge bb">JanMar 15</span>
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Office(s)</th>
                  <th>Production YTD</th>
                  <th>Cases</th>
                  <th>Accept %</th>
                  <th>Avg/Case</th>
                  <th>vs 2025</th>
                </tr>
              </thead>
              <tbody>
                {(data?.providers ?? []).map((p, i) => {
                  const vsArr = ['+14%', '+11%', '+9%', '+13%']
                  return (
                    <tr key={p.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className={`av ${p.cls}`}>{p.av}</div>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{p.office}</td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>${(p.prod/1000).toFixed(1)}k</td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{p.cases}</td>
                      <td>
                        <span className={`badge ${p.accept >= 75 ? 'bg' : p.accept >= 65 ? 'ba' : 'br'}`}>{p.accept}%</span>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>${Math.round(p.prod / p.cases)}</td>
                      <td><span className="badge bg">{vsArr[i]}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="divider" />
          <div className="sec-t" style={{ marginBottom: 10 }}>Case Acceptance by Procedure Type</div>
          {(data?.acceptance ?? []).map(a => (
            <div key={a.code} style={{ marginBottom: 10 }}>
              <div className="row" style={{ marginBottom: 3 }}>
                <span style={{ fontSize: 12 }}>{a.proc} <span style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10 }}>({a.code})</span></span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{a.pct}%</span>
              </div>
              <div className="pw"><div className="pf" style={{ width: `${a.pct}%`, background: a.color }} /></div>
            </div>
          ))}
        </div>

        {/* Office comparison + KPI table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h">
              <div className="sec-t">Office Comparison  YTD 2026</div>
            </div>
            {(data?.offices ?? []).map(o => {
              const elapsed = 74 / 365 // ~74 days of 365
              const pace = Math.round((o.prod / (o.goal * elapsed)) * 100)
              return (
                <div key={o.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="row" style={{ marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{o.name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>${(o.prod/1000).toFixed(1)}k</span>
                      <span className="badge bg" style={{ marginLeft: 8, fontSize: 9 }}>YOY {o.vs}</span>
                    </div>
                  </div>
                  <div className="pw" style={{ height: 6, marginBottom: 4 }}>
                    <div className={`pf ${pace >= 90 ? 'pf-g' : pace >= 70 ? 'pf-a' : 'pf-r'}`} style={{ width: `${Math.min(pace, 100)}%`, height: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)' }}>
                    <span>{o.patients} patients  -  {o.newPt} new</span>
                    <span>Collections: {o.colRate}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="card">
            <div className="card-h">
              <div className="sec-t">KPI Comparison: 2026 vs 2025</div>
            </div>
            <div className="tw">
              <table>
                <thead>
                  <tr><th>Metric</th><th>2026 YTD</th><th>2025 YTD</th><th>Change</th></tr>
                </thead>
                <tbody>
                  {(data?.kpis ?? []).map(([m, v26, v25, chg, up]) => (
                    <tr key={String(m)}>
                      <td style={{ fontSize: 12 }}>{m}</td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 12 }}>{v26}</td>
                      <td style={{ color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 12 }}>{v25}</td>
                      <td>
                        <span style={{ color: up ? 'var(--green-600)' : 'var(--red-400)', fontWeight: 700, fontSize: 12 }}>{chg}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Deep dive subtabs */}
      <div className="card">
        <div className="card-h">
          <div className="sec-t">Analytics Deep Dive</div>
          <div className="subtabs">
            {TABS.map((t, i) => (
              <div key={t} className={`stab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>
            ))}
          </div>
        </div>
        {tab === 0 && (
          <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
            <strong>Production YTD: $284,200</strong> across 3 offices. March MTD: $184,200  on pace for $87k vs $78k goal (+12%). Top CDT codes by revenue: D2750 crown (84 units, $116k), D1110 prophy (406 units, $75k), D4341 SRP (112 units, $32k), D6010 implant (14 units, $31k). North Campus is the fastest-growing location at +22% YOY.
          </div>
        )}
        {tab === 1 && (
          <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
            <strong>Collections Rate: 88.4%</strong> YTD. Outstanding A/R: $28,420. Top payer by volume: Delta Dental ($84,200 collected). Contractual adjustment rate: 8.2%  within industry benchmark (610%). 7 denied claims totaling $4,820 pending refile. ERA posting lag average: 2.1 days. Main Office leads all locations at 89% collection rate.
          </div>
        )}
        {tab === 2 && (
          <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
            <strong>187 new patients YTD</strong> (+15% vs 2025 pace). Monthly average: 62/month vs 54 last year. Top acquisition source: Google (44%), patient referral (28%), social media (18%), direct mail (10%). Recall compliance: 62% vs 75% target. Biggest gap office: Trinity Sealy at 58%. Active patient base: 2,154. Inactive (12+ mo): 312 patients.
          </div>
        )}
        {tab === 3 && (
          <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
            <strong>Treatment acceptance: 74%</strong> group average. Dr. Patel leads at 78%; Dr. Lee at 71%. Unaccepted treatment value on books: <strong>$142,800</strong>. Breakdown: crowns ($84k, 61 cases), implants ($38k, 17 cases), ortho consults ($20k, 11 cases). Patients with unaccepted TX not yet recalled: 38. Case presentation timing: same-day acceptance 81% vs deferred 43%.
          </div>
        )}
        {tab === 4 && (
          <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
            <strong>Overhead: 58%</strong> of production YTD  below the &lt;=62% target. Breakdown: staffing 42%, supplies 8%, rent/occupancy 6%, lab fees 4%, other 4%. Supply cost down 0.8pp vs 2025 after Patterson renegotiation. Largest opportunity: reduce lab fees at North Campus (currently 5.2% vs 3.8% benchmark) by auditing crown cases sent vs in-house milling candidates.
          </div>
        )}
      </div>

    </div>
  )
}

