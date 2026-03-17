'use client'
import { useResource } from '@/hooks/useResource'

interface Office {
  name: string; address: string; phone: string; chairs: number;
  providers: string[]; mtdProd: number; mtdCol: number; newPts: number;
  goalProd: number; hours: string; lease: string; equipment: string;
  manager: string;
}

type OfficesData = {
  offices: Office[]
}

const colRate = (o: Office) => ((o.mtdCol / o.mtdProd) * 100).toFixed(1);
const goalPct = (o: Office) => Math.min(Math.round((o.mtdProd / o.goalProd) * 100), 100);

export default function Offices() {
  const { data, isLoading } = useResource<OfficesData>('offices')

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const offices = data?.offices ?? []

  const totalProd = offices.reduce((a, o) => a + o.mtdProd, 0);
  const totalCol = offices.reduce((a, o) => a + o.mtdCol, 0);
  const totalNewPts = offices.reduce((a, o) => a + o.newPts, 0);

  return (
    <div>
      <div className="row" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Offices & Locations</div>
          <div style={{ color: 'var(--text2)', marginTop: 2 }}>Trinity Dental Centers  3 locations  March 15, 2026</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm">Add Location</button>
          <button className="btn btn-sm">Export</button>
        </div>
      </div>

      <div className="g4" style={{ marginBottom: 24 }}>
        {[['Total Locations', '3', 'Sealy  -  Katy Main  -  North', ''], ['Total Chairs', '12', '5 + 4 + 3 chairs', ''], ['Active Providers', '4', 'Dr. Patel, Lee, Maria, Kim', ''], ['MTD Combined', '$83,676', `Col: $${totalCol.toLocaleString()}`, 'up']].map(([lbl, val, sub, dir]) => (
          <div className="card" key={lbl}><div className="metric"><div className="m-lbl">{lbl}</div><div className="m-val">{val}</div><div className={`m-sub ${dir}`}>{sub}</div></div></div>
        ))}
      </div>

      <div className="g3" style={{ marginBottom: 16 }}>
        {offices.map(o => {
          const pct = goalPct(o);
          const barColor = pct >= 80 ? 'var(--green-400)' : pct >= 50 ? 'var(--blue-600)' : 'var(--amber-400)';
          return (
            <div className="card" key={o.name}>
              <div className="row" style={{ marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{o.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{o.address}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{o.phone}</div>
                </div>
                <span className="badge bb">{o.chairs} chairs</span>
              </div>

              <div className="g2" style={{ marginBottom: 12 }}>
                <div><div style={{ fontSize: 11, color: 'var(--text3)' }}>MTD Production</div><div style={{ fontWeight: 700, fontSize: 18 }}>${o.mtdProd.toLocaleString()}</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--text3)' }}>MTD Collections</div><div style={{ fontWeight: 700, fontSize: 18 }}>${o.mtdCol.toLocaleString()}</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--text3)' }}>New Patients</div><div style={{ fontWeight: 700, fontSize: 18 }}>{o.newPts}</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--text3)' }}>Col Rate</div><div style={{ fontWeight: 700, fontSize: 18 }}>{colRate(o)}%</div></div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div className="row" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>Monthly Goal Progress</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="pw"><div className="pf" style={{ width: `${pct}%`, background: barColor }} /></div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Target: ${o.goalProd.toLocaleString()}</div>
              </div>

              <div className="divider" />
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                <strong>Providers:</strong> {o.providers.join(', ')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                <strong>Hours:</strong> {o.hours}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                <strong>Manager:</strong> {o.manager}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{o.lease}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{o.equipment}</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="sec-t" style={{ marginBottom: 12 }}>Office Comparison Table  March MTD</div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Office</th><th>Chairs</th><th>Providers</th><th>MTD Prod</th><th>MTD Col</th>
                <th>Col %</th><th>New Pts</th><th>Goal</th><th>% to Goal</th><th>Manager</th>
              </tr>
            </thead>
            <tbody>
              {offices.map(o => {
                const pct = goalPct(o);
                return (
                  <tr key={o.name}>
                    <td style={{ fontWeight: 600 }}>{o.name}</td>
                    <td>{o.chairs}</td>
                    <td>{o.providers.length}</td>
                    <td>${o.mtdProd.toLocaleString()}</td>
                    <td>${o.mtdCol.toLocaleString()}</td>
                    <td>{colRate(o)}%</td>
                    <td>{o.newPts}</td>
                    <td style={{ color: 'var(--text2)' }}>${o.goalProd.toLocaleString()}</td>
                    <td>
                      <span className={pct >= 80 ? 'badge bg' : pct >= 50 ? 'badge bb' : 'badge ba'}>{pct}%</span>
                    </td>
                    <td style={{ fontSize: 12 }}>{o.manager}</td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border)' }}>
                <td>TOTAL</td><td>12</td><td>4</td>
                <td>${totalProd.toLocaleString()}</td><td>${totalCol.toLocaleString()}</td>
                <td>{((totalCol / totalProd) * 100).toFixed(1)}%</td>
                <td>{totalNewPts}</td>
                <td>${offices.reduce((a, o) => a + o.goalProd, 0).toLocaleString()}</td>
                <td><span className="badge bb">{Math.round((totalProd / offices.reduce((a, o) => a + o.goalProd, 0)) * 100)}%</span></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div><div className="ai-title">Location Insights</div><div className="ai-sub">AI-generated operational notes</div></div>
        </div>
        <div className="ai-item"><span className="ai-num">1</span>Trinity Sealy is pacing strongest at 54% to goal with 15 days remaining. Dr. Patel's implant caseload is the primary driver.</div>
        <div className="ai-item"><span className="ai-num">2</span>North Campus is at 57% to goal but only open Tue/Thu/Sat  consider adding one additional open day in Q2 to increase capacity.</div>
        <div className="ai-item"><span className="ai-num">3</span>Main Office Saturday hours (9am2pm) generated $4,200 last Saturday  highest per-hour production across all locations.</div>
      </div>
    </div>
  );
}
