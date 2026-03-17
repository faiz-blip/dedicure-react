'use client'
import { usePreAuths } from '@/hooks/usePreAuths'
import type { PreAuth } from '@/hooks/usePreAuths'

function fmtDate(iso: string) {
  if (!iso || iso.startsWith('0001')) return ''
  return new Date(iso).toLocaleDateString()
}

function statusCls(s: string) {
  if (s === 'Approved') return 'bg'
  if (s === 'Denied')   return 'br'
  if (s === 'Expired')  return 'bx'
  return 'ba'
}

export default function PreAuth() {
  const { preAuths, isLoading, isError } = usePreAuths()

  const auths = preAuths ?? []
  const pending  = auths.filter(a => a.Status === 'Pending').length
  const approved = auths.filter(a => a.Status === 'Approved').length
  const denied   = auths.filter(a => a.Status === 'Denied').length
  const totalApproved = auths
    .filter(a => a.Status === 'Approved')
    .reduce((s, a) => s + (a.InsPayAmt ?? 0), 0)

  return (
    <>
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric"><div className="m-lbl">Active Pre-Auths</div><div className="m-val">{auths.length}</div></div>
        <div className="metric"><div className="m-lbl">Pending Response</div><div className="m-val warn">{pending}</div></div>
        <div className="metric"><div className="m-lbl">Approved MTD</div><div className="m-val up">{approved}</div></div>
        <div className="metric"><div className="m-lbl">Denied / Appealing</div><div className="m-val dn">{denied}</div></div>
      </div>

      {totalApproved > 0 && (
        <div className="alert al-s" style={{ marginBottom: 14 }}>
          <span>OK</span>
          <span><strong>${totalApproved.toLocaleString()} in approved pre-auths</strong>  ensure procedures are scheduled before expiry dates.</span>
        </div>
      )}

      <div className="card">
        <div className="card-h">
          <div className="sec-t">Pre-Authorization Tracker</div>
          <button className="btn btn-sm btn-p">+ Submit New Pre-Auth</button>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Procedure</th><th>CDT</th><th>Insurance</th>
                <th>Submitted</th><th>Approved Amt</th><th>Expiry</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>Loading pre-authorizations</td></tr>
              )}
              {isError && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--red-400)' }}>Failed to load pre-auths.</td></tr>
              )}
              {!isLoading && !isError && auths.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>No pre-authorizations on file.</td></tr>
              )}
              {auths.map((a: PreAuth) => (
                <tr key={a.PreAuthNum}>
                  <td style={{ fontWeight: 600 }}>{a.PatientName ?? `Patient #${a.PatNum}`}</td>
                  <td style={{ fontSize: 12 }}>{a.Descript || ''}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{a.ProcCode || ''}</td>
                  <td style={{ fontSize: 12 }}>{a.CarrierName || ''}</td>
                  <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(a.DateEntry)}</td>
                  <td style={{ fontWeight: 600, color: a.InsPayAmt > 0 ? 'var(--green-400)' : 'var(--text3)' }}>
                    {a.InsPayAmt > 0 ? `$${a.InsPayAmt.toLocaleString()}` : ''}
                  </td>
                  <td style={{ fontSize: 11, color: a.DateAuthExpired && !a.DateAuthExpired.startsWith('0001') ? 'var(--amber-600)' : 'var(--text3)' }}>
                    {fmtDate(a.DateAuthExpired)}
                  </td>
                  <td><span className={`badge ${statusCls(a.Status)}`}>{a.Status}</span></td>
                  <td>
                    <button className="btn btn-sm">
                      {a.Status === 'Denied' ? 'Appeal' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {auths.some(a => a.Remarks) && (
        <div className="alert al-i" style={{ marginTop: 14 }}>
          <span></span>
          <span>Pre-auth remarks are available in the Details view for each authorization.</span>
        </div>
      )}
    </>
  )
}
