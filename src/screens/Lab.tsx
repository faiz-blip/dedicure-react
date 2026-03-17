'use client'
import { useLabCases, LabCase } from '@/hooks/useLabCases'

function fmtDate(iso: string) {
  if (!iso || iso.startsWith('0001')) return ''
  return new Date(iso).toLocaleDateString()
}

function dueDays(iso: string) {
  if (!iso || iso.startsWith('0001')) return null
  return Math.floor((new Date(iso).getTime() - Date.now()) / 86400000)
}

function caseStatus(c: LabCase) {
  if (c.DateChecked && !c.DateChecked.startsWith('0001')) return 'Checked In'
  if (c.DateRecd && !c.DateRecd.startsWith('0001')) return 'Received'
  const days = dueDays(c.DateDue)
  if (days !== null && days < 0) return 'Overdue'
  if (days !== null && days <= 2) return 'Due Soon'
  return 'In Lab'
}

const STATUS_BADGE: Record<string, string> = {
  'Checked In': 'bg', Received: 'bg', 'Due Soon': 'ba', Overdue: 'br', 'In Lab': 'bb',
}

export default function Lab() {
  const { labCases, isLoading, isError } = useLabCases()
  const cases = labCases ?? []

  const inLab    = cases.filter(c => caseStatus(c) === 'In Lab').length
  const dueSoon  = cases.filter(c => caseStatus(c) === 'Due Soon').length
  const overdue  = cases.filter(c => caseStatus(c) === 'Overdue').length
  const received = cases.filter(c => ['Received', 'Checked In'].includes(caseStatus(c))).length

  return (
    <>
      <div className="g4">
        <div className="metric"><div className="m-lbl">Active Cases</div><div className="m-val">{cases.length}</div></div>
        <div className="metric"><div className="m-lbl">In Lab</div><div className="m-val info">{inLab}</div></div>
        <div className="metric"><div className="m-lbl">Due Soon</div><div className="m-val warn">{dueSoon}</div></div>
        <div className="metric"><div className="m-lbl">Overdue</div><div className="m-val dn">{overdue}</div></div>
      </div>

      {overdue > 0 && (
        <div className="alert al-d" style={{ marginBottom: 14 }}>
          <span> - </span>
          <span><strong>{overdue} case{overdue > 1 ? 's' : ''} overdue from the lab</strong>  contact lab immediately to avoid rescheduling patients.</span>
        </div>
      )}

      <div className="card">
        <div className="card-h">
          <div className="sec-t">Lab Cases</div>
          <div className="subtabs">
            <div className="stab active">All</div>
            <div className="stab">In Lab</div>
            <div className="stab">Due Soon</div>
            <div className="stab">Received</div>
          </div>
          <button className="btn btn-sm btn-p" style={{ marginLeft: 'auto' }}>+ New Case</button>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr><th>Case #</th><th>Patient</th><th>Lab</th><th>Instructions</th><th>Sent</th><th>Due</th><th>Received</th><th>Fee</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>Loading lab cases from OpenDental...</td></tr>}
              {isError   && <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--red-400)' }}>Failed to load lab cases.</td></tr>}
              {!isLoading && !isError && cases.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>No active lab cases.</td></tr>}
              {cases.map((c) => {
                const status = caseStatus(c)
                const days = dueDays(c.DateDue)
                return (
                  <tr key={c.LabCaseNum}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>LC-{String(c.LabCaseNum).padStart(4, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{c.PatientName ?? `Patient #${c.PatNum}`}</td>
                    <td style={{ fontSize: 11 }}>{c.LabName ?? `Lab #${c.LaboratoryNum}`}</td>
                    <td style={{ fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.Instructions || ''}</td>
                    <td style={{ fontSize: 11 }}>{fmtDate(c.DateSent)}</td>
                    <td style={{ fontSize: 11, color: days !== null && days < 0 ? 'var(--red-400)' : days !== null && days <= 2 ? 'var(--amber-600)' : undefined }}>
                      {fmtDate(c.DateDue)}
                      {days !== null && days >= 0 && days <= 5 && <span style={{ fontSize: 9, marginLeft: 4, color: 'var(--amber-600)' }}>{days}d left</span>}
                    </td>
                    <td style={{ fontSize: 11 }}>{fmtDate(c.DateRecd)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>${c.LabFee.toFixed(2)}</td>
                    <td><span className={`badge ${STATUS_BADGE[status] ?? 'bx'}`}>{status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {status === 'In Lab'   && <button className="btn btn-sm" style={{ fontSize: 10 }}>Track</button>}
                        {status === 'Received' && <button className="btn btn-sm btn-p" style={{ fontSize: 10 }}>Seat</button>}
                        <button className="btn btn-sm" style={{ fontSize: 10 }}>Edit</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {received > 0 && (
        <div className="alert al-s" style={{ marginTop: 14 }}>
          <span>...</span>
          <span><strong>{received} case{received > 1 ? 's' : ''} received</strong>  ready to seat at next appointment.</span>
        </div>
      )}
    </>
  )
}

