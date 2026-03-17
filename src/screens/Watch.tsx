'use client'
import { useState } from 'react'

const SESSIONS = [
  { provider: 'Dr. Sarah Patel', av: 'SP', cls: 'av-g', status: 'Connected', pulse: 82, spo2: 98, steps: 3420, stress: 'Low', hrv: 42 },
  { provider: 'Dr. James Lee', av: 'JL', cls: 'av-b', status: 'Connected', pulse: 94, spo2: 97, steps: 1820, stress: 'Medium', hrv: 31 },
  { provider: 'Maria Rodriguez RDH', av: 'MR', cls: 'av-a', status: 'Offline', pulse: null, spo2: null, steps: null, stress: null, hrv: null },
  { provider: 'Kim Park RDH', av: 'KP', cls: 'av-p', status: 'Connected', pulse: 76, spo2: 99, steps: 4180, stress: 'Low', hrv: 55 },
]

const FATIGUE_TIPS = [
  'Dr. Lee\'s HR has been elevated >90 bpm for 45 minutes. Consider a break before the 2 PM block.',
  'Dr. Patel\'s step count (3,420) is well above her average  great circulation during busy morning.',
  'Kim\'s HRV (55) indicates excellent recovery  optimal day for complex perio patients.',
]

export default function Watch() {
  const [handwash, setHandwash] = useState({ count: 34, lastAlert: '10:42 AM', compliance: 91 })

  return (
    <>
      <div className="ai-card" style={{ marginBottom: 16 }}>
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div>
            <div className="ai-title">Apple Watch / Wearable  Provider Biometric Integration</div>
            <div className="ai-sub">Real-time vitals  -  Fatigue monitoring  -  Handwash compliance  -  Operatory ergonomics  -  Wellness alerts</div>
          </div>
          <span className="badge bg" style={{ marginLeft: 'auto' }}>3 of 4 connected</span>
        </div>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="metric"><div className="m-lbl">Providers Online</div><div className="m-val up">3</div></div>
        <div className="metric"><div className="m-lbl">Handwash Compliance</div><div className="m-val up">{handwash.compliance}%</div><div className="m-sub">34 events today</div></div>
        <div className="metric"><div className="m-lbl">Fatigue Alerts Today</div><div className="m-val warn">1</div><div className="m-sub">Dr. Lee  elevated HR</div></div>
        <div className="metric"><div className="m-lbl">Avg Team HRV</div><div className="m-val up">43</div><div className="m-sub">Optimal performance</div></div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h"><div className="sec-t">Live Provider Biometrics</div><span className="badge bg"><span className="live-dot" style={{ background: 'var(--green-600)' }} />Live</span></div>
          <div className="g3">
            {SESSIONS.map((s, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${s.status === 'Connected' ? 'rgba(26,158,114,.2)' : 'var(--border)'}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div className={`av ${s.cls}`}>{s.av}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{s.provider}</div>
                    <span className={`badge ${s.status === 'Connected' ? 'bg' : 'bx'}`} style={{ fontSize: 10 }}>{s.status}</span>
                  </div>
                  {s.status === 'Connected' && <div style={{ fontSize: 22, fontWeight: 300, color: 'var(--red-400)' }}></div>}
                </div>
                {s.status === 'Connected' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { lbl: 'Heart Rate', val: `${s.pulse} bpm`, cls: s.pulse! > 90 ? 'var(--amber-400)' : 'var(--green-400)' },
                      { lbl: 'SpO2', val: `${s.spo2}%`, cls: 'var(--green-400)' },
                      { lbl: 'Steps Today', val: `${s.steps!.toLocaleString()}`, cls: 'var(--blue-400)' },
                      { lbl: 'HRV', val: `${s.hrv}ms`, cls: s.hrv! > 45 ? 'var(--green-400)' : 'var(--amber-400)' },
                      { lbl: 'Stress Level', val: s.stress!, cls: s.stress === 'Low' ? 'var(--green-400)' : 'var(--amber-400)' },
                    ].map(m => (
                      <div key={m.lbl} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '6px 10px' }}>
                        <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 2 }}>{m.lbl}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: m.cls, fontFamily: 'var(--mono)' }}>{m.val}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 12 }}>Watch not connected</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card fixed" style={{ width: 260 }}>
          <div className="card-h"><div className="sec-t">AI Wellness Insights</div></div>
          {FATIGUE_TIPS.map((tip, i) => (
            <div key={i} className={`alert ${i === 0 ? 'al-w' : 'al-s'}`} style={{ marginBottom: 8, fontSize: 11 }}>
              <span>{i === 0 ? '' : 'OK'}</span><span>{tip}</span>
            </div>
          ))}
          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 8 }}><div className="sec-t">Hand Hygiene  HIPAA / OSHA</div></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-400)', marginBottom: 4 }}>{handwash.compliance}% compliance</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{handwash.count} handwash events detected today  -  Last: {handwash.lastAlert}</div>
          <div className="pw" style={{ height: 8, borderRadius: 4 }}>
            <div className="pf pf-g" style={{ width: `${handwash.compliance}%`, height: '100%', borderRadius: 4 }} />
          </div>
          <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }} onClick={() => setHandwash(h => ({ ...h, count: h.count + 1, lastAlert: 'Just now' }))}>Log Manual Handwash</button>
          <div className="divider" />
          <div className="card-t" style={{ marginBottom: 8 }}>Watch Features</div>
          {['Heart rate monitoring', 'Handwash detection (gyroscope)', 'Step counting', 'Break reminders (fatigue)', 'Emergency fall detection', 'HRV / stress tracking'].map(f => (
            <div key={f} className="fin-r"><span style={{ fontSize: 11 }}>{f}</span><span style={{ color: 'var(--green-400)', fontSize: 11 }}>OK</span></div>
          ))}
        </div>
      </div>
    </>
  )
}

