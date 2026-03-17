'use client'
import { useResource } from '@/hooks/useResource'

type ReportsData = {
  categories: { label: string; badge: string; reports: { name: string; desc: string; lastRun: string }[] }[]
  scheduled: { name: string; freq: string; next: string; format: string; recipient: string }[]
  recentRuns: { name: string; ran: string; user: string; format: string }[]
}

const FREQ_BADGE: Record<string, string> = { Daily: 'bg', Weekly: 'bb', Monthly: 'ba' }
const FMT_BADGE: Record<string, string> = { PDF: 'br', CSV: 'bg', Excel: 'bp' }

export default function Reports() {
  const { data, isLoading } = useResource<ReportsData>('reports')

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const REPORT_CATS = data?.categories ?? []
  const SCHEDULED = data?.scheduled ?? []
  const RECENT_RUNS = data?.recentRuns ?? []

  return (
    <>
      <div className="g4">
        <div className="metric"><div className="m-lbl">Reports Run This Month</div><div className="m-val">24</div><div className="m-sub up">- +6 vs last month</div></div>
        <div className="metric"><div className="m-lbl">Scheduled Reports</div><div className="m-val">6</div><div className="m-sub">Running automatically</div></div>
        <div className="metric"><div className="m-lbl">Saved Templates</div><div className="m-val">12</div><div className="m-sub">Custom + standard</div></div>
        <div className="metric"><div className="m-lbl">Last Export</div><div className="m-val">Today</div><div className="m-sub">9:42 AM  -  PDF</div></div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="sec-t">Search Reports</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="inp" style={{ width: 260, padding: '5px 10px', fontSize: 12 }} placeholder="Search by report name or category" />
            <select className="inp" style={{ width: 130, padding: '5px 8px', fontSize: 12 }}>
              <option>All Categories</option>
              <option>Clinical</option>
              <option>Financial</option>
              <option>Operational</option>
              <option>Compliance</option>
            </select>
            <button className="btn btn-sm btn-p">+ New Template</button>
          </div>
        </div>
      </div>

      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {REPORT_CATS.map((cat) => (
            <div className="card" key={cat.label}>
              <div className="card-h">
                <div className="sec-t">{cat.label} Reports</div>
                <span className={`badge ${cat.badge}`}>{cat.reports.length} reports</span>
              </div>
              {cat.reports.map((r, i) => (
                <div key={r.name} style={{ padding: '12px 0', borderBottom: i < cat.reports.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="row" style={{ marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{r.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.5 }}>{r.desc}</div>
                  <div className="row" style={{ gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)', flex: 1 }}>Last run: {r.lastRun}</span>
                    <button className="btn btn-sm" style={{ fontSize: 11 }}>- Run</button>
                    <button className="btn btn-sm" style={{ fontSize: 11 }}> Schedule</button>
                    <button className="btn btn-sm" style={{ fontSize: 11 }}>CSV</button>
                    <button className="btn btn-sm" style={{ fontSize: 11 }}>PDF</button>
                    <button className="btn btn-sm" style={{ fontSize: 11 }}>Excel</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h">
              <div className="sec-t">Scheduled Reports</div>
              <button className="btn btn-sm btn-p">+ Add</button>
            </div>
            {SCHEDULED.map((s, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < SCHEDULED.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="row" style={{ marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 12, flex: 1 }}>{s.name}</span>
                  <span className={`badge ${FREQ_BADGE[s.freq]}`} style={{ fontSize: 10 }}>{s.freq}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Next: {s.next}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.recipient}  -  <span className={`badge ${FMT_BADGE[s.format]}`} style={{ fontSize: 9 }}>{s.format}</span></div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-h"><div className="sec-t">Recent Exports</div></div>
            <div className="tw">
              <table>
                <thead><tr><th>Report</th><th>Run</th><th>Fmt</th><th></th></tr></thead>
                <tbody>
                  {RECENT_RUNS.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, fontSize: 11 }}>{r.name}</td>
                      <td style={{ fontSize: 10, color: 'var(--text2)' }}>{r.ran}</td>
                      <td><span className={`badge ${FMT_BADGE[r.format]}`} style={{ fontSize: 9 }}>{r.format}</span></td>
                      <td><button className="btn btn-sm" style={{ fontSize: 10 }}></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><div className="sec-t">Export Options</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Export All as PDF</button>
              <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Export All as CSV</button>
              <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Export All as Excel</button>
              <button className="btn btn-sm btn-p" style={{ width: '100%', justifyContent: 'center' }}>Send via Email</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
