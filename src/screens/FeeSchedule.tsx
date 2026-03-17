'use client'
import { useResource } from '@/hooks/useResource'

type FeeData = {
  procedures: { code: string; name: string; current: number; p25: number; p50: number; p75: number; recommended: number; diff: number; annualImpact: number }[]
  payers: { payer: string; d2750: number; d4341: number; d1110: number; d0330: number }[]
}

export default function FeeSchedule() {
  const { data, isLoading } = useResource<FeeData>('fee-schedule')

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const procedures = data?.procedures ?? []
  const payers = data?.payers ?? []

  const totalOpportunity = procedures.reduce((s, p) => s + p.annualImpact, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon"></div>
          <div>
            <div className="ai-title">AI Fee Schedule Optimizer</div>
            <div className="ai-sub">Market benchmarking against 1,200+ Texas dental practices  data updated Jan 2026</div>
          </div>
        </div>
      </div>

      <div className="g4">
        <div className="card"><div className="metric"><div className="m-lbl">Procedures Analyzed</div><div className="m-val">284</div><div className="m-sub up">Active in fee schedule</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Underpriced</div><div className="m-val">42</div><div className="m-sub dn">Below market 50th pct</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Annual Opportunity</div><div className="m-val">$28,400</div><div className="m-sub up">If all recs accepted</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Last Market Update</div><div className="m-val">Jan 2026</div><div className="m-sub up">Q1 2026 refresh pending</div></div></div>
      </div>

      <div className="card">
        <div className="card-h">
          <span className="sec-t">AI Fee Recommendations  Top Opportunities</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--green-600)', fontWeight: 600 }}>Total Impact: ${totalOpportunity.toLocaleString()}/yr</span>
            <button className="btn btn-p">Accept All AI Recommendations</button>
          </div>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>CDT Code</th><th>Procedure</th><th>Current Fee</th>
                <th>Market 25th</th><th>Market 50th</th><th>Market 75th</th>
                <th>AI Recommended</th><th>Difference</th><th>Annual Impact</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {procedures.map((p, i) => (
                <tr key={i}>
                  <td><span className="badge bb">{p.code}</span></td>
                  <td style={{ fontSize: 13 }}>{p.name}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>${p.current}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text3)' }}>${p.p25}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text3)' }}>${p.p50}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text3)' }}>${p.p75}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--green-600)', fontWeight: 600 }}>${p.recommended}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--green-600)' }}>+${p.diff}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--green-600)' }}>${p.annualImpact.toLocaleString()}</td>
                  <td><button className="btn btn-sm">Accept</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><span className="sec-t">Payer Fee Schedule Comparison (Key Codes)</span></div>
        <div className="tw">
          <table>
            <thead><tr><th>Payer</th><th>D2750 Crown</th><th>D4341 SRP</th><th>D1110 Prophy</th><th>D0330 Pano</th></tr></thead>
            <tbody>
              {payers.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{p.payer}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>${p.d2750}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>${p.d4341}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>${p.d1110}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>${p.d0330}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, background: 'var(--green-50)' }}>
                <td>Your Current Fee</td>
                <td style={{ fontFamily: 'var(--mono)' }}>$1,100</td>
                <td style={{ fontFamily: 'var(--mono)' }}>$280</td>
                <td style={{ fontFamily: 'var(--mono)' }}>$130</td>
                <td style={{ fontFamily: 'var(--mono)' }}>$155</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
