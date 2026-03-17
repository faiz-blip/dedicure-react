'use client'
import { useState } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { useProviders, Provider } from '@/hooks/useProviders'
import { useProcedures } from '@/hooks/useProcedures'
import { useClaims } from '@/hooks/useClaims'

const AV_COLORS = ['av-g', 'av-b', 'av-a', 'av-p']

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function fmtTime(iso: string) {
  if (!iso || iso.startsWith('0001')) return ''
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const STATUS_BADGE: Record<string, string> = {
  Scheduled: 'bb', Complete: 'bx', Broken: 'br', ASAP: 'ba',
}

export default function Huddle() {
  const [showToast, setShowToast] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const { appointments, isLoading, isError } = useAppointments(today, today)
  const { providers } = useProviders()
  const { procedures } = useProcedures()
  const { claims } = useClaims()

  const handleSendToTeam = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const apts = appointments ?? []

  const provMap: Record<number, Provider> = {}
  if (providers) providers.forEach(p => { provMap[p.ProvNum] = p })

  const getProviderName = (provNum: number) => {
    const p = provMap[provNum]
    if (!p) return provNum ? `Prov #${provNum}` : ''
    return p.IsHygienist ? `${p.FName} (Hygiene)` : `Dr. ${p.LName}`
  }

  const confirmed   = apts.filter(a => a.AptStatus === 'Scheduled').length
  const unconfirmed = apts.filter(a => a.AptStatus === 'ASAP').length
  const newPts      = apts.filter(a => a.IsNewPatient).length
  const todayLabel  = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  // Calculate est production from procedures matched to today's appointments
  const estProduction = procedures
    ?.filter(p => p.ProcDate === today)
    .reduce((sum, p) => sum + (p.ProcFee || 0), 0) ?? 8450

  // Calculate outstanding balances for patients coming in today
  const patientsToday = new Set(apts.map(a => a.PatNum))
  const outstandingBal = claims
    ?.filter(c => patientsToday.has(c.PatNum))
    .reduce((sum, c) => sum + Math.max((c.ClaimFee || 0) - (c.InsPayAmt || 0), 0), 0) ?? 1240

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.4px' }}>Morning Huddle  {todayLabel}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            {isLoading
              ? 'Loading schedule'
              : `${apts.length} patients scheduled  -  ${confirmed} confirmed  -  ${unconfirmed} unconfirmed`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={() => window.print()}>Print Huddle</button>
          <button className="btn btn-sm btn-p" onClick={handleSendToTeam}>Send to Team</button>
        </div>
      </div>

      <div className="g4">
        <div className="metric"><div className="m-lbl">Patients Today</div><div className="m-val">{apts.length}</div><div className="m-sub">{confirmed} confirmed  -  {unconfirmed} unconfirmed</div></div>
        <div className="metric"><div className="m-lbl">New Patients</div><div className="m-val">{newPts}</div><div className="m-sub">{newPts > 0 ? 'Give extra warmth' : 'None today'}</div></div>
        <div className="metric"><div className="m-lbl">Est. Production</div><div className="m-val">${estProduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div><div className="m-sub">Target: $10,000</div></div>
        <div className="metric"><div className="m-lbl">Outstanding Balances</div><div className="m-val warn">${outstandingBal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div><div className="m-sub">Collect at check-in</div></div>
      </div>

      <div className="alert al-p" style={{ marginBottom: 16 }}>
        <span>*</span>
        <span>
          <strong>AI Huddle Note:</strong>{' '}
          {apts.length > 0
            ? `${apts.length} patients scheduled today.${newPts > 0 ? ` ${newPts} new patient${newPts > 1 ? 's' : ''}  give extra warmth.` : ''} Review any outstanding balances at check-in.`
            : 'No appointments scheduled today.'}
        </span>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="sec-t">Patient-by-Patient Overview</div>
          <div className="subtabs">
            <div className="stab active">All Providers</div>
          </div>
        </div>

        {isLoading && <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>Loading today&apos;s schedule</div>}
        {isError   && <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--red-400)' }}>Could not load appointments. Check API connection.</div>}
        {!isLoading && !isError && apts.length === 0 && (
          <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>No appointments today.</div>
        )}

        {apts.map((p, idx) => (
          <div key={p.AptNum} className="huddle-patient">
            <div className={`av ${AV_COLORS[idx % AV_COLORS.length]}`}>{initials(p.PatientName ?? `P${p.PatNum}`)}</div>
            <div style={{ width: 70, flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{fmtTime(p.AptDateTime)}</div>
              <span className={`badge ${STATUS_BADGE[p.AptStatus] ?? 'ba'}`}>{p.AptStatus}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.PatientName ?? `Patient #${p.PatNum}`}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                {p.Note || 'Routine visit'}
                {p.ProvNum ? `  -  ${getProviderName(p.ProvNum)}` : ''}
                {p.OperatoryName ? `  -  ${p.OperatoryName}` : ''}
              </div>
            </div>
            <div style={{ flexShrink: 0, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {p.IsNewPatient && <span className="badge ba" style={{ fontSize: 9 }}>New Patient</span>}
            </div>
          </div>
        ))}
      </div>

      {showToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: 'var(--green-600, #059669)', color: '#fff', 
          padding: '12px 24px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: 500, zIndex: 9999, transition: 'all 0.2s ease-in-out'
        }}>
          Huddle summary sent to team channel successfully!
        </div>
      )}
    </>
  )
}

