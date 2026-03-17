export default function Credentialing() {
  const enrollments = [
    { provider: 'Dr. Patel', payer: 'Delta Dental', npi: '1234567890', status: 'Active', effective: 'Jan 1, 2024', expiration: 'Dec 31, 2026', daysLeft: 291 },
    { provider: 'Dr. Patel', payer: 'Cigna', npi: '1234567890', status: 'Active', effective: 'Mar 1, 2024', expiration: 'Feb 28, 2026', daysLeft: 0 },
    { provider: 'Dr. Lee', payer: 'Delta Dental', npi: '2345678901', status: 'Active', effective: 'Jun 1, 2023', expiration: 'May 31, 2026', daysLeft: 77 },
    { provider: 'Dr. Lee', payer: 'Aetna', npi: '2345678901', status: 'Pending', effective: '', expiration: '', daysLeft: 999 },
    { provider: 'Dr. Lee', payer: 'MetLife', npi: '2345678901', status: 'Active', effective: 'Apr 1, 2024', expiration: 'Mar 31, 2027', daysLeft: 381 },
    { provider: 'Hygienist Maria', payer: 'Delta Dental', npi: '3456789012', status: 'Active', effective: 'Jan 1, 2025', expiration: 'Dec 31, 2026', daysLeft: 291 },
    { provider: 'Dr. Patel', payer: 'United Concordia', npi: '1234567890', status: 'Active', effective: 'Feb 1, 2025', expiration: 'Jan 31, 2027', daysLeft: 322 },
    { provider: 'Dr. Lee', payer: 'Humana', npi: '2345678901', status: 'In Review', effective: '', expiration: '', daysLeft: 999 },
  ];

  const licenses = [
    { provider: 'Dr. Patel', type: 'TX Dental License', number: 'TX-28841', expiry: 'Aug 31, 2026', daysLeft: 169, status: 'Active' },
    { provider: 'Dr. Patel', type: 'DEA Certificate', number: 'BP4821293', expiry: 'Apr 30, 2026', daysLeft: 46, status: 'Expiring' },
    { provider: 'Dr. Patel', type: 'Malpractice Insurance', number: 'ML-44821', expiry: 'Dec 31, 2026', daysLeft: 291, status: 'Active' },
    { provider: 'Dr. Lee', type: 'TX Dental License', number: 'TX-31204', expiry: 'Aug 31, 2027', daysLeft: 534, status: 'Active' },
    { provider: 'Dr. Lee', type: 'DEA Certificate', number: 'BL9203847', expiry: 'Mar 31, 2026', daysLeft: 16, status: 'Critical' },
    { provider: 'Dr. Lee', type: 'Malpractice Insurance', number: 'ML-50044', expiry: 'Jun 30, 2026', daysLeft: 107, status: 'Active' },
    { provider: 'Hygienist Maria', type: 'TX Hygiene License', number: 'TX-H9821', expiry: 'Sep 30, 2026', daysLeft: 199, status: 'Active' },
    { provider: 'Hygienist Maria', type: 'Malpractice Insurance', number: 'ML-61022', expiry: 'Dec 31, 2026', daysLeft: 291, status: 'Active' },
  ];

  const statusBadge = (s: string) => s === 'Active' ? 'bg' : s === 'Pending' || s === 'In Review' ? 'ba' : s === 'Expiring' ? 'ba' : s === 'Critical' ? 'br' : 'bx';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="alert al-w">
        <strong>2 credentials expiring within 60 days:</strong> Dr. Patel DEA (Apr 30) and Dr. Lee DEA (Mar 31, 2026  16 days). Renewal packets sent via DocuSign.
      </div>

      <div className="g4">
        <div className="card"><div className="metric"><div className="m-lbl">Providers</div><div className="m-val">8</div><div className="m-sub up">All offices</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Payer Enrollments</div><div className="m-val">34</div><div className="m-sub up">Across 12 payers</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Expiring Soon</div><div className="m-val">2</div><div className="m-sub dn">Action required</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Avg Enrollment Time</div><div className="m-val">47 days</div><div className="m-sub up">Industry avg: 90 days</div></div></div>
      </div>

      <div className="card">
        <div className="card-h"><span className="sec-t">Payer Enrollment Status</span><button className="btn btn-sm">+ Add Enrollment</button></div>
        <div className="tw">
          <table>
            <thead><tr><th>Provider</th><th>Payer</th><th>NPI</th><th>Status</th><th>Effective</th><th>Expiration</th><th>Days Left</th><th>Action</th></tr></thead>
            <tbody>
              {enrollments.map((e, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{e.provider}</td>
                  <td>{e.payer}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{e.npi}</td>
                  <td><span className={`badge ${statusBadge(e.status)}`}>{e.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{e.effective}</td>
                  <td style={{ fontSize: 12 }}>{e.expiration}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: e.daysLeft < 60 && e.daysLeft < 999 ? 'var(--red-400)' : 'var(--text2)' }}>
                    {e.daysLeft < 999 ? e.daysLeft : ''}
                  </td>
                  <td><button className="btn btn-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><span className="sec-t">Licenses & Credentials</span></div>
        <div className="tw">
          <table>
            <thead><tr><th>Provider</th><th>Credential Type</th><th>Number</th><th>Expiry</th><th>Days Left</th><th>Status</th></tr></thead>
            <tbody>
              {licenses.map((l, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{l.provider}</td>
                  <td>{l.type}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{l.number}</td>
                  <td style={{ fontSize: 12 }}>{l.expiry}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: l.daysLeft < 60 ? 'var(--red-400)' : 'var(--text2)', fontWeight: l.daysLeft < 60 ? 700 : 400 }}>{l.daysLeft}</td>
                  <td><span className={`badge ${statusBadge(l.status)}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
