'use client'
import { useState } from 'react'
import { useAI } from '@/hooks/useAI'
import { useResource } from '@/hooks/useResource'

type ForecastData = {
  forecast: { month: string; projected: number; low: number; high: number }[]
  scenarios: { name: string; desc: string; revenue: number; badge: string; delta: string }[]
  drivers: { factor: string; impact: string; direction: string; detail: string }[]
  risks: { title: string; detail: string; sev: string }[]
  actuals: { month: string; actual: number; predicted: number }[]
}

export default function AiForecasting() {
  const [scenarioQuery, setScenarioQuery] = useState('')
  const [scenarioAnswer, setScenarioAnswer] = useState<string | null>(null)
  const [askedScenario, setAskedScenario] = useState<string | null>(null)

  const { data, isLoading } = useResource<ForecastData>('forecasting')

  const { generateContent, isLoading: aiLoading } = useAI({
    systemInstruction: 'You are a dental practice financial forecasting advisor. Answer questions about revenue projections, growth scenarios, risk factors, and practice optimization using the provided practice context. Be specific and data-driven. Keep responses under 200 words.',
  })

  const askScenario = async () => {
    const q = scenarioQuery.trim()
    if (!q) return
    setAskedScenario(q)
    setScenarioQuery('')
    const context = `Practice context: Trinity Dental Centers. Current month projected: $68,400. Q2 projected: $204,800. YoY growth: 14%. Recall rate: 62% (target 75%). Key risks: Dr. Lee contract renewal Aug 2026, $28,420 A/R outstanding, seasonal summer dip Jul-Aug. Drivers: +22% new patient growth, Dr. Lee at full capacity, fee schedule 23 codes underpriced.`
    const result = await generateContent(`${context}\n\nQuestion: ${q}`)
    if (result) setScenarioAnswer(result)
  }

  const forecast = data?.forecast ?? []
  const scenarios = data?.scenarios ?? []
  const drivers = data?.drivers ?? []
  const risks = data?.risks ?? []
  const actuals = data?.actuals ?? []

  const maxBar = actuals.length ? Math.max(...actuals.map(a => Math.max(a.actual, a.predicted))) : 1
  const fmt = (n: number) => `$${n.toLocaleString()}`

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-2)' }}>Loading…</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div>
            <div className="ai-title">AI Revenue Forecasting</div>
            <div className="ai-sub">Forecasting model trained on 18 months of Trinity Dental data. Next 12-month projection updated daily.</div>
          </div>
          <span className="badge bg" style={{ marginLeft: 'auto' }}>Updated today</span>
        </div>
      </div>

      <div className="g4">
        <div className="metric"><div className="m-lbl">Model Accuracy</div><div className="m-val">94.2%</div><div className="m-sub up">- +0.8% vs prior model</div></div>
        <div className="metric"><div className="m-lbl">Projected Month End</div><div className="m-val">$68,400</div><div className="m-sub up">- +6.2% vs last year</div></div>
        <div className="metric"><div className="m-lbl">Projected Q2</div><div className="m-val">$204,800</div><div className="m-sub up">- +14% YoY</div></div>
        <div className="metric"><div className="m-lbl">YoY Growth Forecast</div><div className="m-val">14%</div><div className="m-sub up">- Based on 42 variables</div></div>
      </div>

      <div className="card">
        <div className="card-h">
          <span className="sec-t">Monthly Forecast  Apr 2026 through Mar 2027</span>
          <span className="badge bb">12-Month Rolling</span>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr><th>Month</th><th>Projected</th><th>Low (-8%)</th><th>High (+8%)</th></tr>
            </thead>
            <tbody>
              {forecast.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{r.month}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--green-600)', fontWeight: 700 }}>{fmt(r.projected)}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{fmt(r.low)}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{fmt(r.high)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="g3">
        <div className="card">
          <div className="card-h"><span className="sec-t">Scenario Analysis  Q2</span></div>
          {scenarios.map((s, i) => (
            <div key={i} className="fin-r" style={{ paddingBottom: 12, marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                <span className={`badge ${s.badge}`}>{s.delta || 'Base'}</span>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: i === 0 ? 'var(--blue-600)' : i === 1 ? 'var(--green-600)' : 'var(--red-400)' }}>{fmt(s.revenue)}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-h"><span className="sec-t">Key Forecast Drivers</span></div>
          {drivers.map((d, i) => (
            <div key={i} className="fin-r">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{d.factor}</span>
                <span className={`m-sub ${d.direction}`} style={{ fontSize: 11, margin: 0, whiteSpace: 'nowrap', marginLeft: 8 }}>{d.impact}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{d.detail}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-h"><span className="sec-t">Risk Factors</span><span className="badge br">3 items</span></div>
          {risks.map((r, i) => (
            <div key={i} className={`alert ${r.sev}`} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>{r.title}</div>
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>{r.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-h"><span className="sec-t">Ask AI About Your Forecast</span><span className="badge bp">Scenario Analysis</span></div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input
            className="inp"
            style={{ flex: 1 }}
            placeholder="e.g. What if we hire a second hygienist? What's our summer risk?"
            value={scenarioQuery}
            onChange={e => setScenarioQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askScenario()}
          />
          <button className="btn btn-p" onClick={askScenario} disabled={aiLoading || !scenarioQuery.trim()}>
            {aiLoading ? '' : 'Ask AI'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {["What if Dr. Lee leaves?", "How do we hit $80k/month?", "What's driving summer dip?", "Impact of improving recall to 75%?"].map(q => (
            <button key={q} className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => setScenarioQuery(q)}>{q}</button>
          ))}
        </div>
        {(aiLoading || scenarioAnswer) && (
          <div style={{ background: 'var(--green-50)', border: '1px solid rgba(26,158,114,.2)', borderRadius: 10, padding: 14 }}>
            {askedScenario && <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 8 }}>&ldquo;{askedScenario}&rdquo;</div>}
            {aiLoading
              ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>Analyzing scenario</div>
              : <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{scenarioAnswer}</div>}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-h"><span className="sec-t">Forecast vs Actual  Last 6 Months</span><span className="badge bg">Accuracy 94.2%</span></div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}><span style={{ width: 12, height: 3, background: 'var(--blue-600)', display: 'inline-block', borderRadius: 2 }} />Actual</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}><span style={{ width: 12, height: 3, background: 'var(--amber-400)', display: 'inline-block', borderRadius: 2 }} />Predicted</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 90 }}>
          {actuals.map((a, i) => {
            const ah = (a.actual / maxBar) * 80
            const ph = (a.predicted / maxBar) * 80
            const accurate = Math.abs(a.actual - a.predicted) / a.actual < 0.03
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{(a.actual/1000).toFixed(0)}k</div>
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                  <div style={{ width: '42%', height: `${ah}px`, background: 'var(--blue-600)', borderRadius: '3px 3px 0 0', opacity: 0.8 }} />
                  <div style={{ width: '42%', height: `${ph}px`, background: accurate ? 'var(--green-400)' : 'var(--amber-400)', borderRadius: '3px 3px 0 0', opacity: 0.8 }} />
                </div>
                <div style={{ fontSize: 9, color: 'var(--text3)' }}>{a.month}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

