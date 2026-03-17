'use client'
import { useResource } from '@/hooks/useResource'

type PnlRow = { label: string; actual: number; budget: number; pct: number; ytd: number; ytdBudget: number; bold: boolean; indent: number }
type EbitdaLoc = { name: string; rev: number; ebitda: number; margin: number }

type PnlData = {
  rows: PnlRow[]
  ebitdaByLocation: EbitdaLoc[]
}

export default function Pnl() {
  const { data, isLoading, error } = useResource<PnlData>('pnl')

  if (isLoading) return (<div className="p-8 text-center" style={{ color: 'var(--text-2)' }}>Loading…</div>)
  if (error) return (<div className="p-8 text-center" style={{ color: 'var(--red-500)' }}>Error loading P&L data</div>)

  return (
    <>
      <div className="ai-card" style={{ marginBottom: 16 }}>
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div>
            <div className="ai-title" style={{ fontSize: 16 }}>Financial Intelligence  P&L, EBITDA & Overhead Analytics</div>
            <div className="ai-sub">Live QuickBooks sync  -  Per-location P&L  -  Staff cost ratios  -  EBITDA trending  -  Board-ready exports</div>
          </div>
          <span className="badge bg" style={{ marginLeft: 'auto' }}>QuickBooks synced 4 min ago</span>
        </div>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="metric"><div className="m-lbl">Total Revenue MTD</div><div className="m-val">$83,676</div><div className="m-sub up">- 8% vs last year</div></div>
        <div className="metric"><div className="m-lbl">Gross Profit MTD</div><div className="m-val">$58,140</div><div className="m-sub">69.5% margin</div></div>
        <div className="metric"><div className="m-lbl">EBITDA MTD</div><div className="m-val up">$15,060</div><div className="m-sub up">18.0% margin</div></div>
        <div className="metric"><div className="m-lbl">Overhead %</div><div className="m-val warn">61.4%</div><div className="m-sub">Target: &lt;60%</div></div>
      </div>

      <div className="row">
        <div className="card grow" style={{ flex: 2 }}>
          <div className="card-h">
            <div className="sec-t">P&L Summary  March 2026 (All Offices)</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="sel" style={{ fontSize: 11 }}><option>All Offices</option><option>Trinity Sealy</option><option>Main Office</option><option>North Campus</option></select>
              <button className="btn btn-sm">Export to PDF</button>
              <button className="btn btn-sm btn-p">Board Report</button>
            </div>
          </div>
          <div className="tw">
            <table>
              <thead><tr><th>Line Item</th><th>MTD Actual</th><th>MTD Budget</th><th>Variance</th><th>% Revenue</th><th>YTD Actual</th><th>YTD Budget</th></tr></thead>
              <tbody>
                {(data?.rows ?? []).map((row: PnlRow, i: number) => {
                  const variance = row.actual - row.budget
                  const isNeg = row.actual < 0
                  return (
                    <tr key={i} style={{ background: row.bold ? 'var(--gray-50)' : undefined, fontWeight: row.bold ? 700 : undefined }}>
                      <td style={{ paddingLeft: 11 + row.indent * 16 }}>{row.label}</td>
                      <td style={{ color: isNeg ? 'var(--red-600)' : 'var(--green-600)' }}>{row.actual < 0 ? `-$${Math.abs(row.actual).toLocaleString()}` : `$${row.actual.toLocaleString()}`}</td>
                      <td style={{ color: 'var(--text3)' }}>{row.budget < 0 ? `-$${Math.abs(row.budget).toLocaleString()}` : `$${row.budget.toLocaleString()}`}</td>
                      <td style={{ color: variance >= 0 ? 'var(--green-400)' : 'var(--red-400)', fontWeight: 600 }}>{variance >= 0 ? '+' : ''}{variance < 0 ? `-$${Math.abs(variance).toLocaleString()}` : `$${variance.toLocaleString()}`}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{Math.abs(row.pct).toFixed(1)}%</td>
                      <td style={{ color: isNeg ? 'var(--red-600)' : 'var(--green-600)' }}>{row.ytd < 0 ? `-$${Math.abs(row.ytd).toLocaleString()}` : `$${row.ytd.toLocaleString()}`}</td>
                      <td style={{ color: 'var(--text3)' }}>{row.ytdBudget < 0 ? `-$${Math.abs(row.ytdBudget).toLocaleString()}` : `$${row.ytdBudget.toLocaleString()}`}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card fixed" style={{ width: 240 }}>
          <div className="card-h"><div className="sec-t">EBITDA by Location</div></div>
          {(data?.ebitdaByLocation ?? []).map((loc: EbitdaLoc) => (
            <div key={loc.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{loc.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-400)' }}>{loc.margin}%</span>
              </div>
              <div className="fin-r" style={{ borderBottom: 'none', padding: '2px 0' }}><span style={{ fontSize: 11 }}>Revenue</span><span style={{ fontWeight: 600 }}>${loc.rev.toLocaleString()}</span></div>
              <div className="fin-r" style={{ borderBottom: 'none', padding: '2px 0' }}><span style={{ fontSize: 11 }}>EBITDA</span><span style={{ fontWeight: 600, color: 'var(--green-400)' }}>${loc.ebitda.toLocaleString()}</span></div>
              <div className="pw" style={{ height: 5, marginTop: 4 }}>
                <div className="pf pf-g" style={{ width: `${loc.margin * 3}%`, height: '100%' }} />
              </div>
            </div>
          ))}
          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 8 }}><div className="sec-t">AI Financial Insights</div></div>
          <div className="alert al-p" style={{ fontSize: 11, marginBottom: 7 }}><span>*</span><span>Staff cost at 32.1% of revenue. Industry benchmark is 2830%. Reducing by 2% adds ~$20k/year to EBITDA.</span></div>
          <div className="alert al-s" style={{ fontSize: 11, marginBottom: 7 }}><span>OK</span><span>Lab costs at 7.2%  excellent. National avg is 911%.</span></div>
          <div className="alert al-w" style={{ fontSize: 11 }}><span></span><span>Supply spend trending 4% over budget. Patterson order frequency has increased.</span></div>
        </div>
      </div>
    </>
  )
}

