'use client'
import React, { useState } from 'react'
import { useResource } from '@/hooks/useResource'

type OutgoingRef = { patient: string; to: string; specialty: string; date: string; reason: string; status: string; followup: string; provider: string }
type IncomingRef = { patient: string; from: string; date: string; converted: boolean; revenue: string; reason: string }
type TopSending  = { name: string; count: number; specialty: string }
type TopReferring = { name: string; count: number; revenue: string }

type RefData = {
  outgoing: OutgoingRef[]
  incoming: IncomingRef[]
  topSending: TopSending[]
  topReferring: TopReferring[]
}

const OUT_STATUS_BADGE: Record<string, string> = { 'Pending': 'ba', 'Accepted': 'bb', 'Scheduled': 'bp', 'Completed': 'bg' }
const SPECIALTY_BADGE: Record<string, string> = { 'Oral Surgery': 'br', 'Periodontics': 'ba', 'Orthodontics': 'bb', 'Endodontics': 'bp' }

export default function Referrals() {
  const { data, isLoading } = useResource<RefData>('referrals')
  const [tab, setTab] = useState<'out' | 'in'>('out')

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const OUTGOING: OutgoingRef[]  = data?.outgoing   ?? []
  const INCOMING: IncomingRef[]  = data?.incoming   ?? []
  const TOP_SENDING: TopSending[]    = data?.topSending  ?? []
  const TOP_REFERRING: TopReferring[] = data?.topReferring ?? []

  return (
    <>
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric"><div className="m-lbl">Referrals Out MTD</div><div className="m-val">18</div><div className="m-sub up">- +3 vs last month</div></div>
        <div className="metric"><div className="m-lbl">Referrals In MTD</div><div className="m-val">12</div><div className="m-sub up">- +2 vs last month</div></div>
        <div className="metric"><div className="m-lbl">Conversion Rate</div><div className="m-val up">67%</div><div className="m-sub up">- 8 of 12 converted</div></div>
        <div className="metric"><div className="m-lbl">Revenue from Referrals</div><div className="m-val">$8,240</div><div className="m-sub up">- Incoming patients</div></div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h">
            <div className="subtabs">
              <div className={`stab${tab === 'out' ? ' active' : ''}`} onClick={() => setTab('out')}>Outgoing ({OUTGOING.length})</div>
              <div className={`stab${tab === 'in' ? ' active' : ''}`} onClick={() => setTab('in')}>Incoming ({INCOMING.length})</div>
            </div>
            <button className="btn btn-sm btn-p">+ New Referral</button>
          </div>

          {tab === 'out' && (
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Referred To</th>
                    <th>Specialty</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {OUTGOING.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{r.patient}</td>
                      <td style={{ fontSize: 12 }}>{r.to}</td>
                      <td><span className={`badge ${SPECIALTY_BADGE[r.specialty] ?? 'bx'}`}>{r.specialty}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{r.date}</td>
                      <td style={{ fontSize: 11, maxWidth: 200 }}>{r.reason}</td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{r.provider}</td>
                      <td><span className={`badge ${OUT_STATUS_BADGE[r.status] ?? 'bx'}`}>{r.status}</span></td>
                      <td style={{ fontSize: 11, color: r.status === 'Pending' && r.followup !== '' ? 'var(--amber-600)' : 'var(--text2)', fontWeight: r.status === 'Pending' ? 700 : 400 }}>{r.followup}</td>
                      <td><button className="btn btn-sm">{r.status === 'Completed' ? 'View' : 'Follow-up'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'in' && (
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Referred By</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Converted</th>
                    <th>Revenue</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {INCOMING.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{r.patient}</td>
                      <td style={{ fontSize: 12 }}>{r.from}</td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{r.date}</td>
                      <td style={{ fontSize: 11 }}>{r.reason}</td>
                      <td><span className={`badge ${r.converted ? 'bg' : 'bx'}`}>{r.converted ? 'Yes' : 'No'}</span></td>
                      <td style={{ fontWeight: 700, color: r.revenue !== '' ? 'var(--green-600)' : 'var(--text3)' }}>{r.revenue}</td>
                      <td><button className="btn btn-sm">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="card fixed" style={{ width: 230 }}>
          <div className="card-h"><div className="sec-t">Top Specialists (Out)</div></div>
          {TOP_SENDING.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{s.specialty}</div>
              </div>
              <span className={`badge ${SPECIALTY_BADGE[s.specialty] ?? 'bx'}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>{s.count} refs</span>
            </div>
          ))}

          <div className="divider" />

          <div className="card-h" style={{ marginBottom: 8 }}><div className="sec-t">Top Referrers (In)</div></div>
          {TOP_REFERRING.map((r, i) => (
            <div key={i} className="fin-r">
              <div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{r.count} patient{r.count !== 1 ? 's' : ''}</div>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--green-600)', fontSize: 12 }}>{r.revenue}</span>
            </div>
          ))}

          <div className="divider" />

          <div className="card-h" style={{ marginBottom: 6 }}><div className="sec-t">MTD Summary</div></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Referrals out</span><span style={{ fontWeight: 600 }}>18</span></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Referrals in</span><span style={{ fontWeight: 600 }}>12</span></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Conversion rate</span><span style={{ fontWeight: 600, color: 'var(--green-400)' }}>67%</span></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Pending follow-ups</span><span style={{ fontWeight: 600, color: 'var(--amber-400)' }}>2</span></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Revenue from in</span><span style={{ fontWeight: 700 }}>$8,240</span></div>
        </div>
      </div>
    </>
  )
}
