'use client'
import { useState } from 'react'
import { useAppointments, Appointment } from '@/hooks/useAppointments'
import api from '@/lib/api'

const WAITLIST = [
  { name: 'Linda Torres', want: 'Prophy', flex: 'Any time today', dist: '10 min away', cls: 'urgent' },
  { name: 'David Rosario', want: 'Filling', flex: 'Morning preferred', dist: '8 min away', cls: '' },
  { name: 'Amy Chen', want: 'Exam', flex: 'ASAP', dist: '15 min away', cls: '' },
]

const STATUS_BADGE: Record<string, string> = {
  Scheduled:   'bg',
  Complete:    'bx',
  Broken:      'br',
  ASAP:        'ba',
}

const ROW_CLS: Record<string, string> = {
  Scheduled: 'conf-confirmed',
  Complete:  'conf-arrived',
  Broken:    'conf-noshow',
  ASAP:      'conf-unconfirmed',
}

function fmtTime(iso: string) {
  if (!iso || iso.startsWith('0001')) return ''
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

async function updateStatus(aptNum: number, status: string, mutate: () => void) {
  await api.put(`/appointments/${aptNum}`, { AptStatus: status })
  mutate()
}

export default function Checkin() {
  const today = new Date().toISOString().split('T')[0]
  const { appointments, isLoading, isError, mutate } = useAppointments(today, today)

  const [checking, setChecking] = useState<number | null>(null)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const apts = appointments ?? []
  const arrived  = apts.filter(a => a.AptDateTimeArrived && !a.AptDateTimeArrived.startsWith('0001'))
  const seated   = apts.filter(a => a.AptDateTimeSeated && !a.AptDateTimeSeated.startsWith('0001'))
  const complete = apts.filter(a => a.AptStatus === 'Complete')

  const handleCheckin = async (apt: Appointment) => {
    setChecking(apt.AptNum)
    await updateStatus(apt.AptNum, 'Scheduled', mutate)
    showToast(`${apt.PatientName || 'Patient'} successfully checked in and seated.`)
    setChecking(null)
  }

  return (
    <>
      <div className="g4">
        <div className="metric"><div className="m-lbl">Arrived</div><div className="m-val up">{arrived.length}</div></div>
        <div className="metric"><div className="m-lbl">In Chair</div><div className="m-val info">{seated.length}</div></div>
        <div className="metric"><div className="m-lbl">Total Today</div><div className="m-val">{apts.length}</div></div>
        <div className="metric"><div className="m-lbl">Checked Out</div><div className="m-val">{complete.length}</div></div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h">
            <div className="sec-t">Today&apos;s Confirmation Board</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-sm btn-p" onClick={() => showToast('Walk-in registered.')}>+ Walk-in</button>
              <button className="btn btn-sm" onClick={() => showToast('Automated SMS reminders sent.')}>Send All Reminders</button>
            </div>
          </div>

          {isLoading && (
            <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>
              Loading today&apos;s schedule...
            </div>
          )}
          {isError && (
            <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--red-400)' }}>
              Could not load appointments. Check API connection.
            </div>
          )}
          {apts.map((p) => (
            <div 
              key={p.AptNum} 
              className={`conf-row ${ROW_CLS[p.AptStatus] ?? 'conf-unconfirmed'} ${selectedAppt?.AptNum === p.AptNum ? 'selected' : ''}`}
              onClick={() => setSelectedAppt(p)}
              style={{ cursor: 'pointer', outline: selectedAppt?.AptNum === p.AptNum ? '2px solid var(--accent)' : 'none', outlineOffset: -2 }}
            >
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', width: 64, flexShrink: 0 }}>
                {fmtTime(p.AptDateTime)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{p.PatientName ?? `Patient #${p.PatNum}`}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {p.Note || 'Routine visit'}
                  {p.IsNewPatient ? '  -  New Patient' : ''}
                  {p.ProvNum ? `  -  Prov ${p.ProvNum}` : ''}
                </div>
              </div>
              <span className={`badge ${STATUS_BADGE[p.AptStatus] ?? 'ba'}`}>{p.AptStatus}</span>
              <button
                className="btn btn-sm"
                disabled={checking === p.AptNum}
                onClick={(e) => { e.stopPropagation(); handleCheckin(p) }}
              >
                {checking === p.AptNum ? '...' : 'Check In'}
              </button>
            </div>
          ))}
        </div>

        <div className="card fixed" style={{ width: 300 }}>
          <div className="card-h"><div className="sec-t">Patient Check-In</div></div>
          <div style={{ marginBottom: 12 }}>
            <label className="flbl">Search patient</label>
            <div className="search-wrap">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="5.5" cy="5.5" r="4" /><line x1="9" y1="9" x2="12" y2="12" />
              </svg>
              <input type="text" placeholder="Name, DOB, or phone..." value={selectedAppt?.PatientName || ''} onChange={() => {}} />
            </div>
          </div>
          <div className="fgrp"><label className="flbl">Confirm identity (DOB)</label><input className="inp" placeholder="MM/DD/YYYY" value={selectedAppt ? "03/12/1985" : ""} onChange={() => {}} disabled /></div>
          <div className="fgrp"><label className="flbl">Today&apos;s copay</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input className="inp" value={selectedAppt ? "$40.00" : ""} onChange={() => {}} disabled />
              <button className="btn btn-sm btn-p" style={{ whiteSpace: 'nowrap' }} onClick={() => showToast('Payment terminal activated.')} disabled={!selectedAppt}>Collect</button>
            </div>
          </div>
          <div className="fgrp">
            <label className="flbl">Forms status</label>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <span className="badge bg">Medical History OK</span>
              {selectedAppt?.IsNewPatient ? <span className="badge ba">Consent Needed</span> : <span className="badge bg">Consent OK</span>}
              <span className="badge bg">HIPAA  OK</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-p" style={{ flex: 1, justifyContent: 'center' }} onClick={() => selectedAppt ? handleCheckin(selectedAppt) : showToast('Select a patient first.')}>OK Check In &amp; Seat</button>
            <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => showToast('Digital forms sent to patient phone.')} disabled={!selectedAppt}>Send Digital Forms</button>
          </div>
          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 8 }}><div className="sec-t">Check-Out</div></div>
          <div className="fgrp"><label className="flbl">Procedures performed</label><input className="inp" placeholder="D1110, D0274..." value={selectedAppt ? "D1110 - Prophy" : ""} onChange={() => {}} disabled /></div>
          <div className="fgrp"><label className="flbl">Patient portion today</label><input className="inp" placeholder="$0.00" value={selectedAppt ? "$0.00 (Paid in full)" : ""} onChange={() => {}} disabled /></div>
          <div className="fgrp"><label className="flbl">Next appointment</label><input className="inp" placeholder="6-month recall  Sep 2026" value={selectedAppt ? "6-month recall  Sep 2026" : ""} onChange={() => {}} disabled /></div>
          <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => showToast('Check-out completed. Walkout printed.')} disabled={!selectedAppt}>OK Complete Check-Out &amp; Print Walkout</button>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="sec-t">Waitlist  Fill Open Slots</div>
          <button className="btn btn-sm btn-p">+ Add to Waitlist</button>
        </div>
        {WAITLIST.map((w) => (
          <div key={w.name} className={`waitlist-item${w.cls ? ` ${w.cls}` : ''}`}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{w.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{w.want}  -  {w.flex}  -  {w.dist}</div>
            </div>
            {w.cls === 'urgent' && <span className="badge bg">Top Match</span>}
            <button className="btn btn-sm btn-p" onClick={() => showToast(`Booking slot for ${w.name}...`)}>Book Slot</button>
          </div>
        ))}
      </div>

      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: 'var(--blue-600, #2563eb)', color: '#fff', 
          padding: '12px 24px', borderRadius: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          fontWeight: 500, zIndex: 9999, animation: 'slideIn 0.2s ease-out'
        }}>
          {toastMsg}
        </div>
      )}
    </>
  )
}

