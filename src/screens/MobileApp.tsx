export default function MobileApp() {
  const features = [
    { name: 'Daily Schedule View', desc: 'Full appointment calendar with patient summaries and notes', status: 'Planned', quarter: 'Q3 2026' },
    { name: 'Patient Alerts', desc: 'Push alerts for no-shows, urgent flags, lab-ready notifications', status: 'Planned', quarter: 'Q3 2026' },
    { name: 'AI Dictation Trigger', desc: 'One-tap dictation from chairside to SOAP note via Siri/Google', status: 'Beta', quarter: 'Q3 2026' },
    { name: 'Lab Notifications', desc: 'Crown, aligner, and appliance ready-for-seat alerts', status: 'Planned', quarter: 'Q3 2026' },
    { name: 'Billing Approvals', desc: 'Swipe to approve/reject treatment plan changes on the go', status: 'Q4 2026', quarter: 'Q4 2026' },
    { name: 'Production Dashboard', desc: 'Daily/MTD production glance cards per provider', status: 'Q4 2026', quarter: 'Q4 2026' },
    { name: 'Recall Nudges', desc: 'AI recall queue tasks pushed to provider for quick review', status: 'Q1 2027', quarter: 'Q1 2027' },
    { name: 'Patient Messaging', desc: 'HIPAA-secure two-way messaging from app', status: 'Q1 2027', quarter: 'Q1 2027' },
  ];

  const interestedProviders = [
    { name: 'Dr. Patel', role: 'General Dentist', platform: 'iOS', signedUp: 'Mar 10, 2026' },
    { name: 'Dr. Lee', role: 'General Dentist', platform: 'iOS', signedUp: 'Mar 12, 2026' },
    { name: 'Hygienist Maria', role: 'Dental Hygienist', platform: 'Android', signedUp: 'Mar 14, 2026' },
    { name: 'Rachel T. (Office Mgr)', role: 'Office Manager', platform: 'iOS', signedUp: 'Mar 11, 2026' },
    { name: 'Luis G. (Billing)', role: 'Billing Coordinator', platform: 'Android', signedUp: 'Mar 13, 2026' },
    { name: 'Jessica M. (Front Desk)', role: 'Front Desk', platform: 'iOS', signedUp: 'Mar 15, 2026' },
  ];

  const statusColor = (s: string) => s === 'Beta' ? 'ba' : s === 'Planned' ? 'bb' : s === 'Q4 2026' ? 'bp' : 'bx';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon"></div>
          <div>
            <div className="ai-title">Dedicure Mobile App  iOS & Android</div>
            <div className="ai-sub">Provider-first mobile experience. Launching Q3 2026. Join the beta program today.</div>
          </div>
        </div>
      </div>

      <div className="g4">
        <div className="card"><div className="metric"><div className="m-lbl">Beta Signups</div><div className="m-val">24</div><div className="m-sub up">Across 3 offices</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Providers Interested</div><div className="m-val">6</div><div className="m-sub up">All Trinity providers</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Launch Target</div><div className="m-val">Q3 2026</div><div className="m-sub up">July  September</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Platforms</div><div className="m-val">iOS + Android</div><div className="m-sub up">React Native</div></div></div>
      </div>

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><span className="sec-t">App Screen Previews</span><span className="badge ba">Coming Q3 2026</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {['Schedule', 'Patient Alerts', 'Lab Queue', 'Dictation', 'Production', 'Recall'].map((s, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 12, height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155', gap: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {['...', '', '', '', '', ''][i]}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h"><span className="sec-t">Join Beta Program</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="fgrp"><label className="flbl">Name</label><input className="inp" placeholder="Dr. Patel" /></div>
              <div className="fgrp"><label className="flbl">Role</label><select className="inp"><option>Provider (Dentist)</option><option>Hygienist</option><option>Office Manager</option><option>Front Desk</option></select></div>
              <div className="fgrp"><label className="flbl">Platform</label><select className="inp"><option>iOS (iPhone)</option><option>Android</option><option>Both</option></select></div>
              <button className="btn btn-p" style={{ width: '100%' }}>Join Beta  Get Early Access</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><span className="sec-t">Feature Roadmap</span></div>
            {features.map((f, i) => (
              <div key={i} className="fin-r" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{f.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
                  <span className="badge bx" style={{ fontSize: 10 }}>{f.quarter}</span>
                  <span className={`badge ${statusColor(f.status)}`} style={{ fontSize: 10 }}>{f.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-h"><span className="sec-t">Beta Signups  Trinity Dental</span></div>
            {interestedProviders.map((p, i) => (
              <div key={i} className="fin-r" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className={`av ${['av-g', 'av-b', 'av-p', 'av-a', 'av-b', 'av-g'][i]}`}>{p.name[0]}{p.name.split(' ')[1]?.[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.role}  -  {p.signedUp}</div>
                  </div>
                </div>
                <span className={`badge ${p.platform === 'iOS' ? 'bb' : 'bg'}`}>{p.platform}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

