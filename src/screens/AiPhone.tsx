'use client'
import { useState } from 'react'
import { useAI } from '@/hooks/useAI'

const CALL_LOG = [
  { time: '8:02 AM', caller: 'Unknown', phone: '713-555-0188', intent: 'Schedule new patient', resolution: 'Appointment booked', duration: '1:24', escalated: false },
  { time: '8:15 AM', caller: 'Emily Carter', phone: '281-555-0112', intent: 'Reschedule appointment', resolution: 'Rescheduled to Mar 18', duration: '2:01', escalated: false },
  { time: '8:44 AM', caller: 'Robert Ellis', phone: '713-555-0174', intent: 'Insurance question', resolution: 'info provided', duration: '3:12', escalated: true },
  { time: '9:30 AM', caller: 'Marcus Webb', phone: '713-555-0198', intent: 'Crown status inquiry', resolution: 'Lab confirmed ready', duration: '1:08', escalated: false },
  { time: '10:02 AM', caller: 'Unknown', phone: '832-555-0199', intent: 'Emergency toothache', resolution: 'Transferred to front desk', duration: '0:52', escalated: true },
  { time: '10:45 AM', caller: 'Amy Zhang', phone: '832-555-0167', intent: 'Cancel appointment', resolution: 'Cancelled + rebooked', duration: '1:44', escalated: false },
  { time: '11:22 AM', caller: 'Tom Walsh', phone: '281-555-0140', intent: 'New patient inquiry', resolution: 'Appointment booked', duration: '2:18', escalated: false },
  { time: '1:15 PM', caller: 'Unknown', phone: '346-555-0102', intent: 'Payment / balance question', resolution: 'Balance info sent via SMS', duration: '1:31', escalated: false },
]

const SCRIPTS = [
  { title: 'New Patient Welcome', preview: '"Thank you for calling Trinity Dental Centers, this is Ava. Are you a new or returning patient? Wonderful! I\'d love to get you scheduled..."' },
  { title: 'Appointment Reminder', preview: '"Hi [Name], this is Ava from Trinity Dental. I\'m calling to confirm your appointment tomorrow at [Time] with [Provider]..."' },
  { title: 'Recall Outreach', preview: '"Hi [Name], it\'s been a while since your last cleaning at Trinity Dental. We have availability this week  would you like to get scheduled?"' },
  { title: 'Emergency Triage', preview: '"I\'m sorry to hear you\'re in pain. Let me get you connected with our team right away. Are you experiencing swelling or difficulty breathing?"' },
]

export default function AiPhone() {
  const [activeScript, setActiveScript] = useState(0)
  const [scriptContent, setScriptContent] = useState<Record<number, string>>({})

  const { generateContent, isLoading: aiLoading } = useAI({
    systemInstruction: 'You are an AI phone script writer for a dental practice. Write natural, conversational phone scripts for dental receptionists or AI voice systems. Scripts should be warm, professional, and under 150 words. Include [Patient Name], [Provider], and [Time] placeholders where appropriate.',
  })

  const regenerateScript = async () => {
    const script = SCRIPTS[activeScript]
    const prompt = `Rewrite this dental phone script for "${script.title}". Make it warm, natural, and effective. Current version: ${script.preview}`
    const result = await generateContent(prompt)
    if (result) setScriptContent(prev => ({ ...prev, [activeScript]: result }))
  }

  const currentScript = scriptContent[activeScript] ?? SCRIPTS[activeScript].preview

  return (
    <>
      <div className="ai-card" style={{ marginBottom: 16 }}>
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div>
            <div className="ai-title">AI Phone System  Intelligent Inbound & Outbound Voice</div>
            <div className="ai-sub">AI receptionist answers every call  -  Books appointments  -  Handles FAQs  -  Transfers when needed  -  Never misses a call</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge bg">AI Online</span>
            <span className="badge bb">3 lines active</span>
          </div>
        </div>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="metric"><div className="m-lbl">Calls Handled by AI Today</div><div className="m-val up">18</div><div className="m-sub">75% fully resolved</div></div>
        <div className="metric"><div className="m-lbl">Appts Booked by AI</div><div className="m-val up">6</div><div className="m-sub">No human involved</div></div>
        <div className="metric"><div className="m-lbl">Avg Handle Time (AI)</div><div className="m-val">1:42</div><div className="m-sub">vs 4:12 human avg</div></div>
        <div className="metric"><div className="m-lbl">After-Hours Calls Captured</div><div className="m-val up">4</div><div className="m-sub">Would have been missed</div></div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h">
            <div className="sec-t">Live Call Monitor</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--green-600)' }}>
                <span className="live-dot" />AI handling 1 call now
              </span>
              <button className="btn btn-sm">Listen In</button>
              <button className="btn btn-sm btn-p">Take Over</button>
            </div>
          </div>
          <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 16, minHeight: 100, border: '1px solid var(--border)', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div className="av av-g" style={{ flexShrink: 0 }}>AI</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>Ava (AI Receptionist)  Live now</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, background: 'white', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  &ldquo;...and our office hours are Monday through Friday, 8 AM to 5 PM, with Saturday availability at our North Campus location. Would you like me to check availability for a new patient appointment?&rdquo;
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>Caller: Unknown  -  (346) 555-0182  -  0:38 elapsed  -  Intent: Hours & scheduling inquiry</div>
              </div>
            </div>
          </div>

          <div className="card-h" style={{ marginBottom: 10 }}><div className="sec-t">AI Call Log  Today</div></div>
          <div className="tw">
            <table>
              <thead><tr><th>Time</th><th>Caller</th><th>Phone</th><th>Intent</th><th>AI Resolution</th><th>Duration</th><th>Escalated?</th><th></th></tr></thead>
              <tbody>
                {CALL_LOG.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{c.time}</td>
                    <td style={{ fontWeight: 600 }}>{c.caller}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{c.phone}</td>
                    <td>{c.intent}</td>
                    <td style={{ color: 'var(--green-600)' }}>{c.resolution}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{c.duration}</td>
                    <td><span className={`badge ${c.escalated ? 'ba' : 'bg'}`}>{c.escalated ? 'Yes' : 'No'}</span></td>
                    <td><button className="btn btn-sm">Play</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card fixed" style={{ width: 260 }}>
          <div className="card-h"><div className="sec-t">AI Voice Configuration</div></div>
          <div className="fgrp"><label className="flbl">AI Voice Persona</label>
            <select className="inp"><option>Ava  Warm & Professional</option><option>Marcus  Calm & Clear</option><option>Sofia  Friendly & Energetic</option></select>
          </div>
          <div className="fgrp"><label className="flbl">Practice Name (spoken)</label>
            <input className="inp" defaultValue="Trinity Dental Centers" />
          </div>
          {['Book appointments', 'Answer FAQs (hours, insurance)', 'Handle cancellations', 'Emergency after-hours triage', 'Recall outbound calling'].map(feat => (
            <div key={feat} className="fin-r">
              <span style={{ fontSize: 12 }}>{feat}</span>
              <label className="toggle"><input type="checkbox" defaultChecked /><span className="tslider" /></label>
            </div>
          ))}
          <div className="fin-r">
            <span style={{ fontSize: 12 }}>Collect balance payments</span>
            <label className="toggle"><input type="checkbox" /><span className="tslider" /></label>
          </div>
          <div className="divider" />
          <div className="card-t" style={{ marginBottom: 8 }}>Escalation Rules</div>
          {['Dental emergency -> immediate transfer', 'Billing dispute -> front desk', 'Complex scheduling -> scheduler', 'After hours -> voicemail + AI follow-up'].map(r => (
            <div key={r} className="fin-r"><span style={{ fontSize: 11 }}>{r}</span></div>
          ))}
          <button className="btn btn-sm btn-p" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>Test AI Call Flow</button>
        </div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h"><div className="sec-t">AI Phone Script Builder</div><button className="btn btn-sm btn-p">* Generate Script</button></div>
          <div className="pill-tabs">
            {SCRIPTS.map((s, i) => (
              <div key={i} className={`ptab ${activeScript === i ? 'active' : ''}`} onClick={() => setActiveScript(i)}>{s.title}</div>
            ))}
          </div>
          <div style={{ background: 'var(--green-50)', border: '1px solid rgba(26,158,114,.2)', borderRadius: 10, padding: 16, fontSize: 12, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {aiLoading ? <span style={{ color: 'var(--text3)' }}>Generating script</span> : currentScript}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-sm btn-p">Use Script</button>
            <button className="btn btn-sm">Edit Script</button>
            <button className="btn btn-sm" onClick={regenerateScript} disabled={aiLoading}>Regenerate with AI *</button>
          </div>
        </div>
        <div className="card grow">
          <div className="card-h"><div className="sec-t">Call Analytics  This Week</div></div>
          {[['Total Calls', '142'], ['Answered by AI', '107 (75%)'], ['Escalated to Human', '35 (25%)'], ['Appts Booked by AI', '38'], ['Missed / Abandoned', '6'], ['Avg Handle Time', '1:42'], ['Peak Call Hour', '910 AM']].map(([k, v]) => (
            <div key={k} className="fin-r"><span>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
          ))}
        </div>
      </div>
    </>
  )
}

