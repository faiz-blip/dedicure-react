'use client'
import { useClaims, Claim } from '@/hooks/useClaims'

const STATUS_BADGE: Record<string, string> = {
  U: 'bx', S: 'bb', R: 'bg', D: 'br', P: 'ba',
}
const STATUS_LABEL: Record<string, string> = {
  U: 'Unsent', S: 'Sent', R: 'Received', D: 'Denied', P: 'Pre-Auth',
}

function fmtDate(iso: string) {
  if (!iso || iso.startsWith('0001')) return ''
  return new Date(iso).toLocaleDateString()
}

function ageDays(iso: string) {
  if (!iso || iso.startsWith('0001')) return 0
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

export default function Billing() {
  const { claims, isLoading, isError } = useClaims()

  const all     = claims ?? []
  const denied  = all.filter(c => c.ClaimStatus === 'D')
  const pending = all.filter(c => c.ClaimStatus === 'S')
  const totalAR = all.reduce((s, c) => s + (c.ClaimFee - c.InsPayAmt), 0)

  // Calculate A/R Aging buckets
  let ar0_30 = 0, ar31_60 = 0, ar61_90 = 0, arOver90 = 0
  all.forEach(c => {
    const age = ageDays(c.DateSent)
    const bal = c.ClaimFee - c.InsPayAmt
    if (bal > 0) {
      if (age <= 30) ar0_30 += bal
      else if (age <= 60) ar31_60 += bal
      else if (age <= 90) ar61_90 += bal
      else arOver90 += bal
    }
  })

  // Deduplicate and aggregate patient balances
  const balancesByPatient: Record<number, { PatientName: string, Balance: number }> = {}
  all.forEach(c => {
    const bal = c.ClaimFee - c.InsPayAmt
    if (bal > 0) {
      if (!balancesByPatient[c.PatNum]) {
        balancesByPatient[c.PatNum] = { PatientName: c.PatientName ?? `Patient #${c.PatNum}`, Balance: 0 }
      }
      balancesByPatient[c.PatNum].Balance += bal
    }
  })
  
  const sortedPatientBalances = Object.entries(balancesByPatient)
    .map(([patNum, data]) => ({ PatNum: Number(patNum), ...data }))
    .sort((a, b) => b.Balance - a.Balance)
    .slice(0, 6)

  const renderClaim = (c: Claim) => {
    const age = ageDays(c.DateSent)
    return (
      <tr key={c.ClaimNum}>
        <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>#{c.ClaimNum}</td>
        <td style={{ fontWeight: 600 }}>{c.PatientName ?? `Patient #${c.PatNum}`}</td>
        <td style={{ fontSize: 11 }}>{fmtDate(c.DateService)}</td>
        <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>${c.ClaimFee.toFixed(2)}</td>
        <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>${c.InsPayAmt.toFixed(2)}</td>
        <td style={{ fontSize: 11 }}>{c.CarrierName ?? `Plan #${c.PlanNum}`}</td>
        <td><span className={`badge ${STATUS_BADGE[c.ClaimStatus] ?? 'bx'}`}>{STATUS_LABEL[c.ClaimStatus] ?? c.ClaimStatus}</span></td>
        <td style={{ fontSize: 11, color: age > 30 ? 'var(--red-400)' : 'var(--text3)' }}>{age}d</td>
        <td>
          <div style={{ display: 'flex', gap: 4 }}>
            {c.ClaimStatus === 'D' && <button className="btn btn-sm btn-p" style={{ fontSize: 10 }}>Refile</button>}
            <button className="btn btn-sm" style={{ fontSize: 10 }}>View</button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <>
      <div className="g4">
        <div className="metric"><div className="m-lbl">Outstanding A/R</div><div className="m-val dn">${totalAR.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div></div>
        <div className="metric"><div className="m-lbl">Pending Claims</div><div className="m-val warn">{pending.length}</div></div>
        <div className="metric"><div className="m-lbl">Denied Claims</div><div className="m-val dn">{denied.length}</div></div>
        <div className="metric"><div className="m-lbl">Total Claims</div><div className="m-val">{all.length}</div></div>
      </div>

      {denied.length > 0 && (
        <div className="alert al-d" style={{ marginBottom: 14 }}>
          <span> - </span>
          <span><strong>{denied.length} claim{denied.length > 1 ? 's' : ''} denied</strong>  review and refile to recover revenue.</span>
        </div>
      )}

      <div className="card">
        <div className="card-h">
          <div className="sec-t">Claims</div>
          <div className="subtabs">
            <div className="stab active">All</div>
            <div className="stab">Denied</div>
            <div className="stab">Pending</div>
            <div className="stab">Received</div>
          </div>
          <button className="btn btn-sm btn-p" style={{ marginLeft: 'auto' }}>+ New Claim</button>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr><th>Claim #</th><th>Patient</th><th>Date of Service</th><th>Billed</th><th>Paid</th><th>Insurance</th><th>Status</th><th>Age</th><th></th></tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>Loading claims from OpenDental...</td></tr>}
              {isError  && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--red-400)' }}>Failed to load claims. Check API connection.</td></tr>}
              {all.map(renderClaim)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h"><div className="sec-t">A/R Aging</div></div>
          {[
            { label: '030 days', pct: totalAR > 0 ? Math.round((ar0_30 / totalAR) * 100) : 0 },
            { label: '3160 days', pct: totalAR > 0 ? Math.round((ar31_60 / totalAR) * 100) : 0 },
            { label: '6190 days', pct: totalAR > 0 ? Math.round((ar61_90 / totalAR) * 100) : 0 },
            { label: '90+ days', pct: totalAR > 0 ? Math.round((arOver90 / totalAR) * 100) : 0 },
          ].map(r => (
            <div key={r.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span>{r.label}</span><span style={{ fontWeight: 600 }}>{r.pct}%</span>
              </div>
              <div className="pw"><div className={`pf ${r.pct < 20 ? 'pf-g' : r.pct < 35 ? 'pf-a' : 'pf-r'}`} style={{ width: `${r.pct}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="card fixed" style={{ width: 260 }}>
          <div className="card-h"><div className="sec-t">Patient Balances</div><button className="btn btn-sm">Print Statements</button></div>
          {isLoading
            ? <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 11, color: 'var(--text3)' }}>Loading...</div>
            : sortedPatientBalances.map(pb => (
              <div key={pb.PatNum} className="fin-r">
                <span style={{ fontSize: 11 }}>{pb.PatientName}</span>
                <span style={{ fontWeight: 700, color: 'var(--red-400)' }}>${pb.Balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))
          }
          <button className="btn btn-sm btn-p" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>Send All Statements</button>
        </div>
      </div>
    </>
  )
}

