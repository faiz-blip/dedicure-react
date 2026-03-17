'use client'
import { useState } from 'react'
import { usePatients, Patient } from '@/hooks/usePatients'
import { useTreatmentPlanned, Procedure } from '@/hooks/useProcedures'

type Status = 'accepted' | 'pending' | 'declined'

const CDT_NAMES: Record<string, string> = {
  D2391: 'Composite 1S Posterior', D2392: 'Composite 2S Posterior',
  D2393: 'Composite 3S Posterior', D2394: 'Composite 4S Posterior',
  D2750: 'PFM Crown', D2740: 'Porcelain Crown', D2920: 'Crown Seat',
  D2710: 'Resin Crown (Primary)', D1208: 'Fluoride Treatment',
  D0210: 'Full Mouth X-Rays (FMX)', D0330: 'Panoramic X-Ray',
  D4341: 'Scaling & Root Planing', D4910: 'Perio Maintenance',
  D7240: 'Surgical Extraction', D7210: 'Simple Extraction',
  D8080: 'Invisalign Full', D8090: 'Comprehensive Ortho',
  D6010: 'Dental Implant Body', D6065: 'Implant Crown',
  D3310: 'RCT  Anterior', D3320: 'RCT  Premolar', D3330: 'RCT  Molar',
  D1110: 'Adult Prophylaxis', D1120: 'Child Prophylaxis',
}

function getProcName(p: Procedure) {
  const procCode = p.ProcCode ?? p.procCode ?? ''
  return p.Descript || p.descript || (procCode ? CDT_NAMES[procCode] || procCode : 'Unknown procedure')
}

export default function Treatment() {
  const [query, setQuery] = useState('')
  const [selectedPatNum, setSelectedPatNum] = useState<number | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [statusMap, setStatusMap] = useState<Record<number, Status>>({})
  const [showDropdown, setShowDropdown] = useState(false)

  const { patients } = usePatients(100)
  const { procedures, isLoading, isError } = useTreatmentPlanned(selectedPatNum)

  const filtered = query.length >= 2
    ? (patients ?? []).filter(p =>
        `${p.FName} ${p.LName}`.toLowerCase().includes(query.toLowerCase()) ||
        p.ChartNumber?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  const txProcs = procedures ?? []
  const getStatus = (n: number): Status => statusMap[n] ?? 'pending'
  const setStatus = (n: number, s: Status) => setStatusMap(prev => ({ ...prev, [n]: s }))

  const total    = txProcs.reduce((s, p) => s + p.ProcFee, 0)
  const accepted = txProcs.filter(p => getStatus(p.ProcNum) === 'accepted').reduce((s, p) => s + p.ProcFee, 0)
  const pending  = txProcs.filter(p => getStatus(p.ProcNum) === 'pending').reduce((s, p) => s + p.ProcFee, 0)

  const selectPatient = (p: Patient) => {
    setSelectedPatNum(p.PatNum)
    setSelectedPatient(p)
    setQuery(`${p.FName} ${p.LName}`)
    setShowDropdown(false)
    setStatusMap({})
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <input
            className="inp"
            placeholder="Search patient"
            value={query}
            style={{ width: 240 }}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true); if (!e.target.value) { setSelectedPatNum(null); setSelectedPatient(null) } }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filtered.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, minWidth: 260, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}>
              {filtered.map(p => (
                <div
                  key={p.PatNum}
                  style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)' }}
                  onMouseDown={() => selectPatient(p)}
                >
                  {p.FName} {p.LName}
                  {p.Birthdate && !p.Birthdate.startsWith('0001') && (
                    <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>
                      {new Date(p.Birthdate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPatient && (
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
            <div className="av av-b">{selectedPatient.FName[0]}{selectedPatient.LName[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedPatient.FName} {selectedPatient.LName}  Treatment Plan</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                {selectedPatient.Birthdate && !selectedPatient.Birthdate.startsWith('0001')
                  ? `DOB: ${new Date(selectedPatient.Birthdate).toLocaleDateString()}  -  ` : ''}
                Total: ${total.toLocaleString()}
              </div>
            </div>
            <span className="badge ba">Pending</span>
          </div>
        )}

        <div style={{ flex: 1 }} />
        <button className="btn btn-sm btn-p">Present to Patient</button>
        <button className="btn btn-sm">Print Case Summary</button>
        <button className="btn btn-sm">Send Financing Options</button>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h">
            <div className="sec-t">Treatment Plan Items</div>
            <button className="btn btn-sm btn-p">+ Add Procedure</button>
          </div>

          {!selectedPatNum && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
              Search for a patient above to view their treatment plan.
            </div>
          )}
          {isLoading && <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>Loading treatment plan</div>}
          {isError   && <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--red-400)' }}>Failed to load treatment plan.</div>}
          {!isLoading && !isError && selectedPatNum && txProcs.length === 0 && (
            <div style={{ padding: '30px 0', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>No treatment planned procedures for this patient.</div>
          )}

          {txProcs.map(proc => {
            const status = getStatus(proc.ProcNum)
            return (
              <div key={proc.ProcNum} className={`tx-item ${status}`} style={{ cursor: 'default' }}>
                <div className="tx-tooth">{proc.ToothNum || 'All'}</div>
                <div className="tx-info">
                  <div className="tx-proc">{getProcName(proc)}</div>
                  <div className="tx-code">{proc.ProcCode}{proc.Surf ? `  ${proc.Surf}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tx-fee">${proc.ProcFee.toLocaleString()}</div>
                  <div className="tx-ins" style={{ fontSize: 10, color: 'var(--text3)' }}>
                    {proc.DateTP && !proc.DateTP.startsWith('0001') ? `TP: ${new Date(proc.DateTP).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginLeft: 4 }}>
                  <button
                    className="btn btn-sm"
                    style={{ padding: '3px 7px', fontSize: 10, background: status === 'accepted' ? 'var(--green-50)' : undefined, color: status === 'accepted' ? 'var(--green-600)' : undefined }}
                    onClick={() => setStatus(proc.ProcNum, 'accepted')}
                  >OK Accept</button>
                  <button className="btn btn-sm" style={{ padding: '3px 7px', fontSize: 10 }} onClick={() => setStatus(proc.ProcNum, 'declined')}> -  Decline</button>
                </div>
              </div>
            )
          })}

          {txProcs.length > 0 && (
            <>
              <div className="divider" />
              <div className="row" style={{ marginBottom: 0 }}>
                <div style={{ flex: 1 }}>
                  <div className="fin-r"><span style={{ color: 'var(--text2)' }}>Total Treatment</span><span style={{ fontWeight: 700, fontSize: 14 }}>${total.toLocaleString()}</span></div>
                  <div className="fin-r"><span style={{ color: 'var(--text2)' }}>Accepted</span><span style={{ color: 'var(--green-600)', fontWeight: 600 }}>${accepted.toLocaleString()}</span></div>
                  <div className="fin-r"><span style={{ color: 'var(--text2)' }}>Pending Decision</span><span style={{ fontWeight: 700, fontSize: 14 }}>${pending.toLocaleString()}</span></div>
                </div>
                <div className="card fixed" style={{ width: 220, background: 'var(--accent-light)', borderColor: 'rgba(26,158,114,.2)' }}>
                  <div className="card-t" style={{ color: 'var(--green-600)', marginBottom: 10 }}>Patient Financing</div>
                  {[
                    { label: 'CareCredit 12-mo 0%', mo: `$${Math.round(total / 12)}/mo` },
                    { label: 'Sunbit 24-mo', mo: `$${Math.round(total / 24)}/mo` },
                    { label: 'In-house payment plan', mo: 'Custom' },
                  ].map(f => (
                    <div key={f.label} className="fin-r">
                      <span style={{ fontSize: 11, color: 'var(--green-800)' }}>{f.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--green-800)', fontWeight: 600 }}>{f.mo}</span>
                    </div>
                  ))}
                  <button className="btn btn-sm btn-p" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Apply for Financing</button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card fixed" style={{ width: 240 }}>
          <div className="card-h"><div className="sec-t">Case Acceptance</div></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Treatment presented</span><span style={{ fontWeight: 600 }}>${total.toLocaleString()}</span></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Accepted</span><span style={{ fontWeight: 600, color: 'var(--green-400)' }}>${accepted.toLocaleString()}</span></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Pending decision</span><span style={{ fontWeight: 600, color: 'var(--amber-400)' }}>${pending.toLocaleString()}</span></div>
          {total > 0 && (
            <div className="fin-r">
              <span style={{ fontSize: 11 }}>Accept rate</span>
              <span style={{ fontWeight: 700 }}>{Math.round((accepted / total) * 100)}%</span>
            </div>
          )}
          <div className="divider" />
          <div className="card-t" style={{ marginBottom: 8 }}>Pre-Authorization</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            {selectedPatNum ? 'Check Pre-Auth screen for implants & major procedures.' : 'Select a patient to view pre-auth status.'}
          </div>
          <button className="btn btn-sm" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>Check Pre-Auth Status</button>
        </div>
      </div>
    </>
  )
}

