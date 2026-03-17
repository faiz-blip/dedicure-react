export default function PatientPortal() {
  const officeAdoption = [
    { office: 'Main Office', active: 512, total: 820, pct: 62 },
    { office: 'Trinity Sealy', active: 398, total: 710, pct: 56 },
    { office: 'North Campus', active: 332, total: 640, pct: 52 },
  ];

  const recentActivity = [
    { time: '10:38 AM', type: 'Appointment Request', patient: 'Emily Zhao', detail: 'Requesting cleaning on Mar 22', status: 'Pending' },
    { time: '10:22 AM', type: 'Form Submission', patient: 'Robert Chavez', detail: 'New patient intake form completed', status: 'Complete' },
    { time: '10:14 AM', type: 'Payment Made', patient: 'Sandra Kim', detail: '$340 statement balance paid', status: 'Complete' },
    { time: '09:58 AM', type: 'Message Sent', patient: 'Tom Nguyen', detail: 'Question about post-op instructions', status: 'Pending' },
    { time: '09:42 AM', type: 'Appointment Request', patient: 'Aisha Thompson', detail: 'Requesting recall visit Mar 25', status: 'Pending' },
    { time: '09:18 AM', type: 'Payment Made', patient: 'Marcus Webb', detail: '$180 copay for crown prep visit', status: 'Complete' },
    { time: '08:55 AM', type: 'Form Submission', patient: 'Priya Nair', detail: 'Medical history update submitted', status: 'Complete' },
    { time: '08:40 AM', type: 'Message Sent', patient: 'James Owens', detail: 'Inquiry about whitening pricing', status: 'Pending' },
  ];

  const pendingItems = [
    { type: 'Appointment Request', count: 3, urgency: 'medium' },
    { type: 'Patient Messages', count: 4, urgency: 'high' },
    { type: 'Form Reviews', count: 1, urgency: 'low' },
  ];

  const featureConfig = [
    { feature: 'Online Appointment Booking', enabled: true, description: 'Patients can request and book visits' },
    { feature: 'Online Bill Pay', enabled: true, description: 'Stripe-powered secure payment portal' },
    { feature: 'Digital Intake Forms', enabled: true, description: 'Paperless new patient & update forms' },
    { feature: 'Secure Patient Messaging', enabled: true, description: 'HIPAA-compliant two-way messaging' },
    { feature: 'Treatment Plan Review', enabled: false, description: 'Patients view and accept treatment plans' },
    { feature: 'Lab Result Notifications', enabled: false, description: 'Push alerts when lab results are ready' },
  ];

  const typeColor = (t: string) => t === 'Payment Made' ? 'bg' : t === 'Appointment Request' ? 'bb' : t === 'Message Sent' ? 'ba' : 'bx';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="g4">
        <div className="card"><div className="metric"><div className="m-lbl">Active Accounts</div><div className="m-val">1,242</div><div className="m-sub up">+48 this month</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Portal Adoption</div><div className="m-val">57%</div><div className="m-sub up">+3% vs last month</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Pending Requests</div><div className="m-val">8</div><div className="m-sub dn">Needs staff response</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Payments This Month</div><div className="m-val">$4,280</div><div className="m-sub up">+22% vs Feb</div></div></div>
      </div>

      <div className="g3">
        <div className="card">
          <div className="card-h"><span className="sec-t">Adoption by Office</span></div>
          {officeAdoption.map((o, i) => (
            <div key={i} className="fin-r">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{o.office}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{o.active}/{o.total}</span>
              </div>
              <div className="pw" style={{ marginBottom: 4 }}><div className="pf pf-g" style={{ width: `${o.pct}%` }} /></div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{o.pct}% adoption rate</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-h"><span className="sec-t">Pending Items</span><span className="badge br">8 total</span></div>
          {pendingItems.map((p, i) => (
            <div key={i} className="fin-r" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.type}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Needs response</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700 }}>{p.count}</span>
                <span className={`badge ${p.urgency === 'high' ? 'br' : p.urgency === 'medium' ? 'ba' : 'bx'}`}>{p.urgency}</span>
              </div>
            </div>
          ))}
          <button className="btn btn-p" style={{ marginTop: 8, width: '100%' }}>View All Pending</button>
        </div>

        <div className="card">
          <div className="card-h"><span className="sec-t">Feature Configuration</span></div>
          {featureConfig.map((f, i) => (
            <div key={i} className="fin-r" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{f.feature}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{f.description}</div>
              </div>
              <span className={`badge ${f.enabled ? 'bg' : 'bx'}`}>{f.enabled ? 'ON' : 'OFF'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-h"><span className="sec-t">Recent Portal Activity</span><button className="btn btn-sm">View All Activity</button></div>
        <div className="tw">
          <table>
            <thead><tr><th>Time</th><th>Type</th><th>Patient</th><th>Detail</th><th>Status</th></tr></thead>
            <tbody>
              {recentActivity.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)' }}>{a.time}</td>
                  <td><span className={`badge ${typeColor(a.type)}`}>{a.type}</span></td>
                  <td style={{ fontWeight: 500 }}>{a.patient}</td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{a.detail}</td>
                  <td><span className={`badge ${a.status === 'Complete' ? 'bg' : 'ba'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
