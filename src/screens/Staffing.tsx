'use client'
import { useState } from 'react'
import { useResource } from '@/hooks/useResource'

type StaffingData = {
  days: string[]
  staff: { name: string; role: string; av: string; cls: string; schedule: Record<string, string>; hours: number; rate: string; status: string; office: string }[]
}

interface Staff {
  name: string; role: string; av: string; cls: string
  schedule: Record<string, string>
  hours: number; rate: string; status: string; office: string
}

const cellStyle = (val: string): React.CSSProperties => {
  if (val === 'OFF')     return { color: 'var(--text3)', fontSize: 11 }
  if (val === 'PTO')     return { color: 'var(--blue-600)', fontWeight: 700, fontSize: 11 }
  if (val === 'OPEN')    return { color: 'var(--amber-400)', fontWeight: 700, fontSize: 11 }
  if (val === 'CALLOUT') return { color: 'var(--red-400)', fontWeight: 700, fontSize: 11 }
  if (val === 'Sick')    return { color: 'var(--red-400)', fontWeight: 600, fontSize: 11 }
  return { fontSize: 11, fontFamily: 'var(--mono)' }
}

const cellBg = (val: string): React.CSSProperties => {
  if (val === 'PTO')     return { background: 'rgba(37,99,235,0.07)' }
  if (val === 'OPEN')    return { background: 'rgba(245,158,11,0.08)' }
  if (val === 'CALLOUT') return { background: 'rgba(239,68,68,0.07)' }
  if (val === 'OFF')     return { background: 'rgba(0,0,0,0.03)' }
  return {}
}

const statusBadge: Record<string, string> = { 'Active': 'bg', 'OT Risk': 'ba', 'PTO': 'bb' }

export default function Staffing() {
  const [showShift, setShowShift] = useState(false)
  const [showSwap, setShowSwap]   = useState(false)

  const { data, isLoading } = useResource<StaffingData>('staffing')

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const STAFF = data?.staff ?? []
  const DAYS = data?.days ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div className="row">
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Staff Scheduling</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>Week of Mar 1622, 2026  -  All Locations</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm btn-p" onClick={() => setShowShift(s => !s)}>+ Add Shift</button>
          <button className="btn btn-sm" onClick={() => setShowSwap(s => !s)}>Request Swap</button>
          <button className="btn btn-sm">Print Schedule</button>
        </div>
      </div>

      <div className="g4">
        <div className="metric"><div className="m-lbl">Staff Scheduled Today</div><div className="m-val">8</div><div className="m-sub">of 8 needed</div></div>
        <div className="metric"><div className="m-lbl">Open Shifts</div><div className="m-val warn">1</div><div className="m-sub dn">Mon AM  Front Desk</div></div>
        <div className="metric"><div className="m-lbl">Overtime Risk</div><div className="m-val warn">2</div><div className="m-sub dn">Dr. Lee  -  Mike DA</div></div>
        <div className="metric"><div className="m-lbl">PTO This Week</div><div className="m-val">1</div><div className="m-sub">Maria  Thu &amp; Fri</div></div>
      </div>

      <div className="alert al-d">
        <span> - </span>
        <span><strong>Rosa (DA) called out Friday 3/20  no coverage.</strong> Dr. Lee has 4 chair-side procedures scheduled. Assign backup or notify Dr. Lee to adjust his afternoon block. <button className="btn btn-sm" style={{ marginLeft: 8 }}>Assign Backup</button></span>
      </div>

      <div className="alert al-w">
        <span></span>
        <span><strong>Tyler (Front Desk) has an open shift Monday 3/16 morning</strong>  shift starts 10 AM, office opens 8 AM. Jade M. is available for early coverage (pre-approved OT). <button className="btn btn-sm" style={{ marginLeft: 8 }}>Approve Coverage</button></span>
      </div>

      {showShift && (
        <div className="card">
          <div className="card-h">
            <div className="sec-t">Add Shift</div>
            <button className="btn btn-sm" onClick={() => setShowShift(false)}>Cancel</button>
          </div>
          <div className="g3">
            <div className="fgrp">
              <label className="flbl">Staff Member</label>
              <select className="inp">
                {STAFF.map(s => <option key={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="fgrp"><label className="flbl">Date</label><input className="inp" type="date" defaultValue="2026-03-16" /></div>
            <div className="fgrp"><label className="flbl">Office Location</label>
              <select className="inp"><option>Trinity Sealy</option><option>Main Office</option><option>North Campus</option></select>
            </div>
            <div className="fgrp"><label className="flbl">Start Time</label><input className="inp" type="time" defaultValue="08:00" /></div>
            <div className="fgrp"><label className="flbl">End Time</label><input className="inp" type="time" defaultValue="17:00" /></div>
            <div className="fgrp"><label className="flbl">Shift Type</label>
              <select className="inp"><option>Regular</option><option>Overtime</option><option>On-Call</option><option>Float</option></select>
            </div>
          </div>
          <div className="fgrp" style={{ marginTop: 8 }}><label className="flbl">Notes</label><input className="inp" placeholder="Coverage reason or special instructions" /></div>
          <div className="row" style={{ gap: 8, marginTop: 12 }}>
            <button className="btn btn-sm btn-p">Save Shift</button>
            <button className="btn btn-sm" onClick={() => setShowShift(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showSwap && (
        <div className="card">
          <div className="card-h">
            <div className="sec-t">Request Shift Swap</div>
            <button className="btn btn-sm" onClick={() => setShowSwap(false)}>Cancel</button>
          </div>
          <div className="g2">
            <div className="fgrp"><label className="flbl">Requesting Staff</label>
              <select className="inp">{STAFF.map(s => <option key={s.name}>{s.name}</option>)}</select>
            </div>
            <div className="fgrp"><label className="flbl">Swap With</label>
              <select className="inp">{STAFF.map(s => <option key={s.name}>{s.name}</option>)}</select>
            </div>
            <div className="fgrp"><label className="flbl">My Shift Date</label><input className="inp" type="date" defaultValue="2026-03-20" /></div>
            <div className="fgrp"><label className="flbl">Their Shift Date</label><input className="inp" type="date" defaultValue="2026-03-21" /></div>
          </div>
          <div className="fgrp" style={{ marginTop: 8 }}><label className="flbl">Reason</label><input className="inp" placeholder="Brief explanation for swap request" /></div>
          <div className="row" style={{ gap: 8, marginTop: 12 }}>
            <button className="btn btn-sm btn-p">Submit Request</button>
            <button className="btn btn-sm" onClick={() => setShowSwap(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Schedule grid */}
      <div className="card">
        <div className="card-h">
          <div className="sec-t">Weekly Schedule Grid</div>
          <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text2)' }}>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8,height:8,background:'var(--green-400)',borderRadius:2,display:'inline-block'}} />Scheduled</span>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8,height:8,background:'var(--blue-600)',borderRadius:2,display:'inline-block'}} />PTO</span>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8,height:8,background:'var(--amber-400)',borderRadius:2,display:'inline-block'}} />Open</span>
            <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8,height:8,background:'var(--red-400)',borderRadius:2,display:'inline-block'}} />Callout</span>
          </div>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}>Staff Member</th>
                {DAYS.map(d => <th key={d} style={{ minWidth: 82, textAlign: 'center' }}>{d}</th>)}
                <th style={{ minWidth: 72 }}>Hrs</th>
              </tr>
            </thead>
            <tbody>
              {STAFF.map(s => (
                <tr key={s.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className={`av ${s.cls}`} style={{ width: 28, height: 28, fontSize: 11 }}>{s.av}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{s.role}</div>
                      </div>
                    </div>
                  </td>
                  {DAYS.map(d => (
                    <td key={d} style={{ textAlign: 'center', ...cellBg(s.schedule[d]) }}>
                      <span style={cellStyle(s.schedule[d])}>{s.schedule[d]}</span>
                    </td>
                  ))}
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 12, color: s.hours > 40 ? 'var(--amber-400)' : s.hours < 30 ? 'var(--text3)' : 'var(--text1)' }}>
                      {s.hours}h
                    </span>
                    {s.hours > 40 && <span className="badge ba" style={{ marginLeft: 4, fontSize: 9 }}>OT</span>}
                    {s.status === 'PTO' && <span className="badge bb" style={{ marginLeft: 4, fontSize: 9 }}>PTO</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff sidebar cards */}
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 2 }}>
          <div className="card">
            <div className="card-h"><div className="sec-t">Staff Overview</div></div>
            <div className="tw">
              <table>
                <thead>
                  <tr><th>Name</th><th>Role</th><th>Office</th><th>Hours This Week</th><th>Compensation</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {STAFF.map(s => (
                    <tr key={s.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className={`av ${s.cls}`} style={{ width: 26, height: 26, fontSize: 10 }}>{s.av}</div>
                          <span style={{ fontWeight: 600, fontSize: 12 }}>{s.name.split(' (')[0]}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{s.role}</td>
                      <td style={{ fontSize: 11 }}>{s.office}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: s.hours > 40 ? 'var(--amber-400)' : 'var(--text1)' }}>{s.hours}h</span>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{s.rate}</td>
                      <td><span className={`badge ${statusBadge[s.status] ?? 'bx'}`}>{s.status}</span></td>
                      <td><button className="btn btn-sm">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card fixed" style={{ width: 220 }}>
          <div className="sec-t" style={{ marginBottom: 12 }}>Weekly Hours Summary</div>
          {STAFF.map(s => {
            const pct = Math.min(Math.round((s.hours / 40) * 100), 110)
            return (
              <div key={s.name} style={{ marginBottom: 10 }}>
                <div className="row" style={{ marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{s.name.split(' (')[0]}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.hours > 40 ? 'var(--amber-400)' : 'var(--text2)' }}>{s.hours}h</span>
                </div>
                <div className="pw" style={{ height: 5 }}>
                  <div className={`pf ${s.hours > 40 ? 'pf-a' : s.hours >= 32 ? 'pf-g' : ''}`} style={{ width: `${Math.min(pct,100)}%`, height: '100%' }} />
                </div>
              </div>
            )
          })}
          <div className="divider" />
          <div className="fin-r"><span style={{ fontSize:11 }}>Total hrs this week</span><span style={{ fontWeight:700 }}>303h</span></div>
          <div className="fin-r"><span style={{ fontSize:11 }}>OT hours flagged</span><span style={{ fontWeight:700, color:'var(--amber-400)' }}>5h</span></div>
          <div className="fin-r"><span style={{ fontSize:11 }}>Est. payroll impact</span><span style={{ fontWeight:700 }}>$22,480</span></div>
        </div>
      </div>

    </div>
  )
}
