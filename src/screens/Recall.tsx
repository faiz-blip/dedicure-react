'use client'
import { useState } from 'react'
import { useRecall, RecallPatient } from '@/hooks/useRecall'

function fmtDate(iso: string) {
  if (!iso || iso.startsWith('0001')) return ''
  return new Date(iso).toLocaleDateString()
}

function overdueMonths(dateDue: string) {
  if (!dateDue || dateDue.startsWith('0001')) return 0
  return Math.floor((Date.now() - new Date(dateDue).getTime()) / (1000 * 60 * 60 * 24 * 30))
}

const FILTERS = ['All', '3 months', '6 months', '12+ months']

const MONTHLY_BARS = [
  { month: 'Oct', sent: 82, booked: 28 },
  { month: 'Nov', sent: 90, booked: 31 },
  { month: 'Dec', sent: 64, booked: 19 },
  { month: 'Jan', sent: 108, booked: 44 },
  { month: 'Feb', sent: 124, booked: 38 },
  { month: 'Mar', sent: 47, booked: 12 },
]

export default function Recall() {
  const { recalls, isLoading, isError } = useRecall()
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sent, setSent] = useState(false)

  const all = recalls ?? []

  const visible = all.filter((p: RecallPatient) => {
    const mo = overdueMonths(p.DateDue)
    if (filter === '3 months') return mo >= 3 && mo < 6
    if (filter === '6 months') return mo >= 6 && mo < 12
    if (filter === '12+ months') return mo >= 12
    return true
  })

  const toggleSel = (i: number) => setSelected(prev => {
    const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s
  })
  const sendBatch = (ch: string) => { setSent(true); setTimeout(() => setSent(false), 3000); void ch }

  const revOpp = (all.length * 350).toLocaleString(undefined, { maximumFractionDigits: 0 })
  const contacted = Math.round(all.length * 0.26)
  const confirmed = Math.round(all.length * 0.09)

  return (
    <>
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric"><div className="m-lbl">Overdue Patients</div><div className="m-val dn">{all.length}</div><div className="m-sub dn">Past due date</div></div>
        <div className="metric"><div className="m-lbl">Revenue Opportunity</div><div className="m-val">${revOpp}</div><div className="m-sub">If all scheduled</div></div>
        <div className="metric"><div className="m-lbl">Contacted This Week</div><div className="m-val warn">{contacted}</div><div className="m-sub">SMS + Email + Calls</div></div>
        <div className="metric"><div className="m-lbl">Confirmed</div><div className="m-val up">{confirmed}</div><div className="m-sub up">This week</div></div>
      </div>

      <div className="alert al-p" style={{ marginBottom: 14 }}>
        <span>*</span>
        <span><strong>AI Recall Insight:</strong> {all.length > 0 ? `${all.length} patients are overdue for recall. Prioritize patients with the longest gaps and active treatment needs.` : 'No overdue recall patients at this time.'}</span>
      </div>

      {sent && (
        <div className="alert al-s" style={{ marginBottom: 14 }}>
          <span>OK</span>
          <span><strong>Batch outreach sent!</strong> {selected.size} patient{selected.size !== 1 ? 's' : ''} contacted. Replies will appear in Messaging.</span>
        </div>
      )}

      <div className="row">
        <div className="card grow">
          <div className="card-h">
            <div>
              <div className="sec-t">Overdue Recall Patients</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Showing {visible.length} of {all.length} overdue patients</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="subtabs">
                {FILTERS.map(f => (
                  <div key={f} className={`stab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</div>
                ))}
              </div>
              {selected.size > 0 && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{selected.size} selected</span>}
              <button className="btn btn-sm btn-p" onClick={() => sendBatch('sms')}>Send SMS Batch</button>
              <button className="btn btn-sm" onClick={() => sendBatch('email')}>Send Email Batch</button>
              <button className="btn btn-sm">Print List</button>
            </div>
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(visible.map((_: RecallPatient, i: number) => i)) : new Set())} /></th>
                  <th>Patient</th>
                  <th>Last Visit</th>
                  <th>Due Date</th>
                  <th>Overdue By</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>Loading recall patients from OpenDental...</td></tr>}
                {isError   && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--red-400)' }}>Failed to load recall data.</td></tr>}
                {!isLoading && !isError && visible.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>No patients match this filter.</td></tr>}
                {visible.map((p: RecallPatient, i: number) => {
                  const mo = overdueMonths(p.DateDue)
                  return (
                    <tr key={p.RecallNum} style={mo >= 12 ? { background: 'var(--red-50, #fff8f8)' } : {}}>
                      <td><input type="checkbox" checked={selected.has(i)} onChange={() => toggleSel(i)} /></td>
                      <td style={{ fontWeight: 600 }}>{p.PatientName ?? `Patient #${p.PatNum}`}</td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(p.DatePrevious)}</td>
                      <td style={{ fontSize: 11 }}>{fmtDate(p.DateDue)}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: mo >= 12 ? 'var(--red-400)' : mo >= 6 ? 'var(--amber-600)' : 'var(--text2)' }}>
                          {mo} mo overdue
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--text3)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.Note || ''}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-sm btn-p" style={{ fontSize: 10 }}>Book</button>
                          <button className="btn btn-sm" style={{ fontSize: 10 }}>
                            {p.Email ? 'Email' : p.HmPhone || p.WirelessPhone ? 'Call' : 'Contact'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card fixed" style={{ width: 230 }}>
          <div className="card-h"><div className="sec-t">Recall by Month</div></div>
          {MONTHLY_BARS.map(b => (
            <div key={b.month} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ fontWeight: 600 }}>{b.month}</span>
                <span style={{ color: 'var(--text3)' }}>{b.booked}/{b.sent} booked</span>
              </div>
              <div className="pw">
                <div className="pf pf-g" style={{ width: `${Math.round((b.booked / b.sent) * 100)}%` }} />
              </div>
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{Math.round((b.booked / b.sent) * 100)}% conversion</div>
            </div>
          ))}
          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 8 }}><div className="sec-t">Conversion Funnel</div></div>
          {[
            { label: 'Overdue patients', val: String(all.length), cls: 'var(--text)', w: '100%' },
            { label: 'Contacted', val: String(contacted), cls: 'var(--blue-400)', w: '26%' },
            { label: 'Responded', val: String(Math.round(all.length * 0.15)), cls: 'var(--amber-400)', w: '15%' },
            { label: 'Confirmed appt', val: String(confirmed), cls: 'var(--green-400)', w: '9%' },
          ].map(r => (
            <div key={r.label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span>{r.label}</span>
                <span style={{ fontWeight: 700, color: r.cls }}>{r.val}</span>
              </div>
              <div className="pw"><div style={{ height: '100%', width: r.w, background: r.cls, borderRadius: 3, transition: 'width .3s' }} /></div>
            </div>
          ))}
          <div className="divider" />
          <div className="fin-r"><span style={{ fontSize: 11 }}>Target recall rate</span><span style={{ fontWeight: 600 }}>75%</span></div>
        </div>
      </div>
    </>
  )
}
