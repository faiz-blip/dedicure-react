'use client'
import { useState } from 'react'
import { useAI } from '@/hooks/useAI'

const SUGGESTED = [
  "What's my busiest day?",
  "Which provider has highest case acceptance?",
  "Why did production drop in February?",
  "Who are my top 10 patients by LTV?",
  "Which insurance plan has most denials?",
  "Who hasn't been seen in 12+ months?",
  "What's my no-show rate by day of week?",
  "Which CDT code drives most revenue?",
]

const PAST_RESULTS = [
  {
    query: "Why did production drop in February?",
    answer: "February production was $58,400  down $9,800 vs January ($68,200). Primary drivers: 3 provider sick days (Dr. Lee out 2 days, Maria out 1 day), a 4-day office closure for HVAC repair, and 14% higher no-show rate vs January. Controllable revenue loss estimated at $6,200.",
    bars: [
      { month: 'Jan', val: 68200, max: 70000 },
      { month: 'Feb', val: 58400, max: 70000 },
      { month: 'Mar', val: 66900, max: 70000 },
    ],
  },
  {
    query: "Which insurance plan has most denials?",
    answer: "Cigna accounts for 34% of all claim denials this quarter. Common reasons: missing X-rays (D2750), frequency limitations (D2392), and predetermination not submitted (D6010).",
    list: [
      { name: 'Cigna', pct: 34, badge: 'br' },
      { name: 'MetLife', pct: 12, badge: 'ba' },
      { name: 'Delta Dental', pct: 8, badge: 'bb' },
      { name: 'Aetna', pct: 5, badge: 'bg' },
    ],
  },
  {
    query: "Who hasn't been seen in 12+ months?",
    answer: "312 patients in your database have not been seen in 12 or more months. Estimated reactivation opportunity: $124,000 at current avg visit value ($397). Top 5 by estimated value shown below.",
    patients: [
      { name: 'Carlos Mendez', last: 'May 2024', est: '$620' },
      { name: 'Linda Torres', last: 'Apr 2024', est: '$580' },
      { name: 'James Whitfield', last: 'Mar 2024', est: '$540' },
      { name: 'Carmen Vega', last: 'Mar 2024', est: '$510' },
      { name: 'David Osei', last: 'Feb 2024', est: '$490' },
    ],
  },
]

const ANOMALIES = [
  {
    title: 'Sudden no-show spike  Thursdays',
    sev: 'al-d',
    detail: 'Thursday no-show rate jumped to 24% over last 3 weeks (vs 8% baseline). All 3 Thursdays affected. Possible correlation with new front-desk schedule rotation.',
    action: 'Review Thursday staffing & reminder cadence',
  },
  {
    title: 'Billing lag  D4341 codes',
    sev: 'al-w',
    detail: '11 D4341 (SRP) procedures completed but not yet billed. Avg lag 4.2 days vs 1.1 day practice average. $3,080 in unbilled production.',
    action: 'Reconcile D4341 claims immediately',
  },
]

export default function AiAnalysis() {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [askedQuery, setAskedQuery] = useState<string | null>(null)

  const { generateContent, isLoading: aiLoading } = useAI({
    systemInstruction: 'You are an AI analytics assistant for a dental practice. Answer questions about practice data, production, scheduling, insurance, and patient trends concisely and professionally. Use specific numbers and actionable insights when possible. Keep responses under 200 words.',
  })

  const handleAsk = async () => {
    const q = query.trim()
    if (!q) return
    setAskedQuery(q)
    setQuery('')
    const result = await generateContent(q)
    setAiAnswer(result)
  }

  const result = PAST_RESULTS[activeIdx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div>
            <div className="ai-title">AI Analytics  Natural Language Interface</div>
            <div className="ai-sub">Ask your practice data anything  connected to Dentrix, QuickBooks &amp; 14 months of Trinity Dental data</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <span className="badge bg">Dentrix</span>
            <span className="badge bg">QuickBooks</span>
            <span className="badge bb">14 mo data</span>
          </div>
        </div>
      </div>

      <div className="g4">
        <div className="metric"><div className="m-lbl">Queries Today</div><div className="m-val">18</div><div className="m-sub up">By 4 staff members</div></div>
        <div className="metric"><div className="m-lbl">Anomalies Detected</div><div className="m-val">2</div><div className="m-sub dn">- This week</div></div>
        <div className="metric"><div className="m-lbl">Data Sources</div><div className="m-val">14</div><div className="m-sub up">All connected</div></div>
        <div className="metric"><div className="m-lbl">Last Refresh</div><div className="m-val">6 min ago</div><div className="m-sub up">Auto-sync active</div></div>
      </div>

      <div className="card">
        <div className="card-h"><span className="sec-t">Ask Your Practice Data Anything</span></div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            className="inp"
            style={{ flex: 1, fontSize: 15, padding: '10px 14px' }}
            placeholder="Ask your practice data anything..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
          />
          <button className="btn btn-p" onClick={handleAsk} disabled={aiLoading}>
            {aiLoading ? '' : 'Ask AI'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SUGGESTED.map((q, i) => (
            <button key={i} className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => { setQuery(q); setActiveIdx(i % 3) }}>{q}</button>
          ))}
        </div>
        {(aiLoading || aiAnswer) && (
          <div style={{ marginTop: 14, background: 'var(--green-50)', border: '1px solid rgba(26,158,114,.2)', borderRadius: 10, padding: 14 }}>
            {askedQuery && <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 8 }}>&ldquo;{askedQuery}&rdquo;</div>}
            {aiLoading
              ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>Analyzing practice data</div>
              : <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiAnswer}</div>}
          </div>
        )}
      </div>

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PAST_RESULTS.map((r, i) => (
            <div
              key={i}
              className="card"
              style={{ cursor: 'pointer', borderColor: activeIdx === i ? 'var(--blue-600)' : undefined, borderWidth: activeIdx === i ? 2 : 1, borderStyle: 'solid' }}
              onClick={() => setActiveIdx(i)}
            >
              <div className="card-h">
                <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>&ldquo;{r.query}&rdquo;</span>
                {activeIdx === i && <span className="badge bb">Active</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>{r.answer}</div>

              {r.bars && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 60, marginTop: 6 }}>
                  {r.bars.map((b, bi) => {
                    const h = (b.val / b.max) * 50
                    return (
                      <div key={bi} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>${(b.val/1000).toFixed(0)}k</div>
                        <div style={{ width: '100%', height: `${h}px`, background: bi === 1 ? 'var(--red-400)' : 'var(--blue-600)', borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
                        <div style={{ fontSize: 9, color: 'var(--text3)' }}>{b.month}</div>
                      </div>
                    )
                  })}
                </div>
              )}

              {r.list && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {r.list.map((item, li) => (
                    <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, width: 90 }}>{item.name}</span>
                      <div className="pw" style={{ flex: 1 }}>
                        <div className={`pf ${item.badge === 'br' ? 'pf-r' : item.badge === 'ba' ? 'pf-a' : 'pf-g'}`} style={{ width: `${item.pct * 2.5}%` }} />
                      </div>
                      <span className={`badge ${item.badge}`} style={{ fontSize: 11, width: 36, textAlign: 'center' }}>{item.pct}%</span>
                    </div>
                  ))}
                </div>
              )}

              {r.patients && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>312 total  -  Top 5 by estimated value</div>
                  {r.patients.map((p, pi) => (
                    <div key={pi} className="fin-r">
                      <span style={{ fontSize: 12 }}>{p.name}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-600)' }}>{p.est}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>Last: {p.last}</div>
                      </div>
                    </div>
                  ))}
                  <div className="alert al-i" style={{ marginTop: 6, fontSize: 12 }}>$124,000 total reactivation opportunity  -  <strong>Send batch recall now -&gt;</strong></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><span className="sec-t">Anomaly Detection</span><span className="badge br">2 this week</span></div>
            <div className="alert al-i" style={{ marginBottom: 10, fontSize: 12 }}>AI continuously monitors your data for unusual patterns, outliers, and revenue risks.</div>
            {ANOMALIES.map((a, i) => (
              <div key={i} className={`alert ${a.sev}`} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{a.detail}</div>
                <span className="badge bx" style={{ fontSize: 10 }}>{a.action}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-h"><span className="sec-t">Connected Data Sources</span><span className="badge bg">14 active</span></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Dentrix (PMS)', 'QuickBooks', 'Insurance ERA', 'Google Ads', 'Patient Portal', 'AI Phone', 'Dexis Imaging', 'Recall Engine', 'ADP Payroll', 'Lab Tracker', 'CBCT (i-CAT)', 'Staff Scheduling', 'Stripe Payments', 'Google Reviews'].map((ds, i) => (
                <span key={i} className="badge bg" style={{ fontSize: 10 }}> -  {ds}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

