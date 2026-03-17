'use client'
import { useState } from 'react'

const OPPORTUNITIES = [
  {
    id: 'OPP-001', name: 'Katy / Cinco Ranch (De Novo)', stage: 'Site Identified', type: 'De Novo', location: 'Katy, TX', pop: '82,400', dentists: 3, fdi: 1.4, estCost: '$1.2M', estYear1Rev: '$480K', estEbitda: '14%', proj: 'Jun 2026', notes: 'LOI being prepared. Excellent demographics  fast-growing suburb.', opp: 480000
  },
  {
    id: 'OPP-002', name: 'Sugar Land Acquistion', stage: 'Due Diligence', type: 'Acquisition', location: 'Sugar Land, TX', pop: '118,000', dentists: 2, fdi: 1.8, estCost: '$2.1M', estYear1Rev: '$1.2M', estEbitda: '22%', proj: 'Apr 2026', notes: 'Practice produces $1.4M/yr. Owner retiring. Negotiating at 1.4 -  revenue.', opp: 1200000
  },
  {
    id: 'OPP-003', name: 'The Woodlands Partnership', stage: 'LOI Signed', type: 'Joint Venture', location: 'The Woodlands, TX', pop: '115,000', dentists: 4, fdi: 1.6, estCost: '$640K', estYear1Rev: '$720K', estEbitda: '18%', proj: 'May 2026', notes: '60/40 JV with Dr. Kim. Site under construction. PPE purchased.', opp: 720000
  },
  {
    id: 'OPP-004', name: 'League City Evaluation', stage: 'Market Research', type: 'De Novo', location: 'League City, TX', pop: '110,000', dentists: 2, fdi: 2.1, estCost: '$900K', estYear1Rev: '$420K', estEbitda: '12%', proj: 'Dec 2026', notes: 'Strong FDI score. Two potential sites being evaluated. Early stage.', opp: 420000
  },
]

const STAGE_CLS: Record<string, string> = { 'Market Research': 'bx', 'Site Identified': 'ba', 'LOI Signed': 'bb', 'Due Diligence': 'bp', 'Closed': 'bg' }
const TYPE_CLS: Record<string, string> = { 'De Novo': 'bg', 'Acquisition': 'bb', 'Joint Venture': 'bt' }

export default function Denovo() {
  const [activeOpp, setActiveOpp] = useState(0)
  const opp = OPPORTUNITIES[activeOpp]
  const totalCommitted = OPPORTUNITIES.filter(o => ['LOI Signed', 'Due Diligence'].includes(o.stage)).reduce((s, o) => s + o.opp, 0)

  return (
    <>
      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="metric"><div className="m-lbl">Active Opportunities</div><div className="m-val">{OPPORTUNITIES.length}</div></div>
        <div className="metric"><div className="m-lbl">Capital Committed</div><div className="m-val warn">$2.4M</div></div>
        <div className="metric"><div className="m-lbl">Projected New Revenue (Yr1)</div><div className="m-val up">$2.8M</div><div className="m-sub">Across all 3 sites</div></div>
        <div className="metric"><div className="m-lbl">Avg FDI Score</div><div className="m-val up">1.7</div><div className="m-sub">1.5+ = viable market</div></div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h"><div className="sec-t">M&A / De Novo Pipeline</div><button className="btn btn-sm btn-p">+ Add Opportunity</button></div>
          {OPPORTUNITIES.map((o, i) => (
            <div key={o.id} onClick={() => setActiveOpp(i)} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 9, border: `1px solid ${activeOpp === i ? 'var(--accent)' : 'var(--border)'}`, background: activeOpp === i ? 'var(--accent-light)' : 'var(--surface)', marginBottom: 8, cursor: 'pointer', transition: 'all .1s' }}>
              <div>
                <span className={`badge ${STAGE_CLS[o.stage]}`}>{o.stage}</span>
                <span className={`badge ${TYPE_CLS[o.type]}`} style={{ marginLeft: 4 }}>{o.type}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{o.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{o.location}  -  Pop. {o.pop}  -  FDI Score: {o.fdi}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-400)' }}>Yr1 Rev: {o.estYear1Rev}</div>
                <div style={{ fontSize: 11 }}>EBITDA: {o.estEbitda}  -  Cost: {o.estCost}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Target: {o.proj}</div>
            </div>
          ))}
        </div>

        <div className="card fixed" style={{ width: 280 }}>
          <div className="card-t" style={{ marginBottom: 10 }}>Opportunity Detail  {opp.name}</div>
          {[
            ['Stage', <span key="s" className={`badge ${STAGE_CLS[opp.stage]}`}>{opp.stage}</span>],
            ['Type', <span key="t" className={`badge ${TYPE_CLS[opp.type]}`}>{opp.type}</span>],
            ['Location', opp.location], ['Est. Population', opp.pop],
            ['FDI Score', `${opp.fdi} (Favorable Dental Index)`],
            ['Existing Dentists in Market', `${opp.dentists}`],
            ['Est. Build / Acquisition Cost', opp.estCost],
            ['Projected Year 1 Revenue', opp.estYear1Rev],
            ['Projected EBITDA Margin', opp.estEbitda],
            ['Target Open Date', opp.proj],
          ].map(([k, v], i) => (
            <div key={i} className="fin-r">
              <span style={{ fontSize: 11 }}>{k}</span>
              <span style={{ fontWeight: 600, fontSize: 11 }}>{v}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text2)', background: 'var(--gray-50)', borderRadius: 8, padding: 10, marginTop: 8, lineHeight: 1.6 }}>{opp.notes}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-sm btn-p" style={{ flex: 1, justifyContent: 'center' }}>Update Stage</button>
            <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Market Report *</button>
          </div>
        </div>
      </div>
    </>
  )
}

