'use client'
import { useAppointments } from '@/hooks/useAppointments'

function fmtTime(iso: string) {
  if (!iso || iso.startsWith('0001')) return ''
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function Eligibility() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const { appointments, isLoading, isError } = useAppointments(tomorrow, tomorrow)

  const apts = appointments ?? []
  const newPts = apts.filter(a => a.IsNewPatient).length

  // Simulated metrics based on schedule volume
  const verifiedToday = Math.round(apts.length * 0.45)
  const pendingVerif = Math.max(apts.length - verifiedToday, 0)
  const remainingAvg = 1140

  return (
    <>
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric"><div className="m-lbl">Verified Today</div><div className="m-val up">{verifiedToday}</div></div>
        <div className="metric">
          <div className="m-lbl">Pending Verification</div>
          <div className="m-val warn">{isLoading ? '' : pendingVerif}</div>
          <div className="m-sub">Tomorrow&apos;s patients</div>
        </div>
        <div className="metric"><div className="m-lbl">New Patients Tomorrow</div><div className="m-val">{newPts}</div></div>
        <div className="metric"><div className="m-lbl">Benefits Remaining Avg</div><div className="m-val">${remainingAvg}</div></div>
      </div>

      {!isLoading && !isError && apts.length > 0 && (
        <div className="alert al-i" style={{ marginBottom: 14 }}>
          <span></span>
          <span>
            <strong>Batch Verify Ready:</strong> {apts.length} patient{apts.length !== 1 ? 's' : ''} scheduled for tomorrow have not been verified this benefit year.
            Run batch verification now to prevent day-of claim issues.
          </span>
        </div>
      )}

      <div className="card">
        <div className="card-h">
          <div className="sec-t">Eligibility Verification  Tomorrow&rsquo;s Schedule</div>
          <button className="btn btn-sm btn-p">Verify All {apts.length > 0 ? apts.length : ''} Now</button>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Time</th><th>Patient</th><th>Provider</th><th>Insurance</th>
                <th>Member ID</th><th>Benefit Year</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>Loading tomorrow&apos;s appointments</td></tr>}
              {isError   && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--red-400)' }}>Failed to load appointments.</td></tr>}
              {!isLoading && !isError && apts.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>No appointments scheduled for tomorrow.</td></tr>
              )}
              {apts.map((a) => (
                <tr key={a.AptNum}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtTime(a.AptDateTime)}</td>
                  <td style={{ fontWeight: 600 }}>
                    {a.PatientName ?? `Patient #${a.PatNum}`}
                    {a.IsNewPatient ? <span className="badge ba" style={{ marginLeft: 6, fontSize: 9 }}>New</span> : null}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text2)' }}>{a.ProviderAbbr ?? (a.ProvNum ? `Prov #${a.ProvNum}` : '')}</td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }}></td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}></td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>2026</td>
                  <td><span className="badge ba">Not Verified</span></td>
                  <td><button className="btn btn-sm">Verify Now</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
