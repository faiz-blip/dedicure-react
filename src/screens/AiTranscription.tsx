'use client'
import { useState } from 'react'
import { useAI } from '@/hooks/useAI'

export default function AiTranscription() {
  const [spokenText, setSpokenText] = useState('')
  const [soapNote, setSoapNote] = useState<string | null>(null)

  const { generateContent, isLoading: aiLoading } = useAI({
    systemInstruction: 'You are a dental clinical documentation AI. Convert spoken dental visit notes into structured SOAP format (Subjective, Objective, Assessment, Plan) and extract relevant CDT codes. Format: S: ... O: ... A: ... P: ... CDT: code1 (description), code2 (description). Be concise and clinically accurate.',
  })

  const generateSoap = async () => {
    if (!spokenText.trim()) return
    const result = await generateContent(`Convert this spoken dental note to SOAP format and extract CDT codes:\n\n"${spokenText}"`)
    if (result) setSoapNote(result)
  }

  const sessions = [
    { patient: 'Marcus Webb', provider: 'Dr. Patel', duration: '41 sec', codes: ['D2750', 'D0120', 'D9310'], status: 'Complete' },
    { patient: 'Sandra Kim', provider: 'Dr. Lee', duration: '33 sec', codes: ['D4341', 'D4342'], status: 'Complete' },
    { patient: 'James Owens', provider: 'Hygienist Maria', duration: '28 sec', codes: ['D1110', 'D0274'], status: 'Complete' },
    { patient: 'Priya Nair', provider: 'Dr. Patel', duration: '52 sec', codes: ['D3310', 'D0220'], status: 'Complete' },
    { patient: 'Robert Chavez', provider: 'Dr. Lee', duration: '37 sec', codes: ['D2391', 'D2392'], status: 'Complete' },
    { patient: 'Aisha Thompson', provider: 'Hygienist Maria', duration: '25 sec', codes: ['D1110', 'D4910'], status: 'Complete' },
    { patient: 'Tom Nguyen', provider: 'Dr. Patel', duration: '44 sec', codes: ['D7210', 'D9930'], status: 'Review' },
    { patient: 'Emily Zhao', provider: 'Dr. Lee', duration: '31 sec', codes: ['D2140', 'D0220'], status: 'Complete' },
  ];

  const cdtConfidence = [
    { code: 'D2750', desc: 'Crown  porcelain fused to metal', confidence: 99 },
    { code: 'D0120', desc: 'Periodic oral evaluation', confidence: 98 },
    { code: 'D9310', desc: 'Consultation (referred patient)', confidence: 94 },
    { code: 'D0274', desc: 'Bitewing radiographs  four images', confidence: 97 },
    { code: 'D4341', desc: 'Periodontal scaling & root planing  4+ teeth', confidence: 96 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon"></div>
          <div>
            <div className="ai-title">AI Clinical Note Transcription</div>
            <div className="ai-sub">Real-time SOAP notes with CDT code extraction  powered by Dedicure NLP v3.2</div>
          </div>
        </div>
      </div>

      <div className="g4">
        <div className="card"><div className="metric"><div className="m-lbl">Notes Today</div><div className="m-val">8</div><div className="m-sub up">All providers</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">CDT Accuracy</div><div className="m-val">97%</div><div className="m-sub up">+1% vs last week</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Avg Note Time</div><div className="m-val">38 sec</div><div className="m-sub up">vs 12 min manual</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Hours Saved</div><div className="m-val">1.8 hrs</div><div className="m-sub up">Today</div></div></div>
      </div>

      <div className="card">
        <div className="card-h"><span className="sec-t">Transcription Sessions  March 15, 2026</span></div>
        <div className="tw">
          <table>
            <thead><tr><th>Patient</th><th>Provider</th><th>Duration</th><th>CDT Codes Extracted</th><th>Status</th></tr></thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i}>
                  <td>{s.patient}</td>
                  <td>{s.provider}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{s.duration}</td>
                  <td>{s.codes.map(c => <span key={c} className="badge bb" style={{ marginRight: 4 }}>{c}</span>)}</td>
                  <td><span className={`badge ${s.status === 'Complete' ? 'bg' : 'ba'}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-h"><span className="sec-t">Live SOAP Note Generator</span><span className="badge bg">AI Powered</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Spoken / Typed Note</div>
              <textarea
                className="inp"
                rows={7}
                style={{ fontSize: 12, resize: 'vertical', lineHeight: 1.6, width: '100%' }}
                placeholder={`Paste or type spoken note here\n\ne.g. "Patient presents for crown prep on #14. Occlusal caries to dentin confirmed on PA. Patient reports cold sensitivity  -  3 weeks. Prep completed, temporized. RTC 2 weeks."`}
                value={spokenText}
                onChange={e => setSpokenText(e.target.value)}
              />
              <button className="btn btn-p btn-sm" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }} onClick={generateSoap} disabled={aiLoading || !spokenText.trim()}>
                {aiLoading ? ' Generating SOAP' : ' Generate SOAP Note'}
              </button>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Structured SOAP Note</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontSize: 13, lineHeight: 1.8, minHeight: 160, whiteSpace: 'pre-wrap' }}>
                {aiLoading && <span style={{ color: 'var(--text3)' }}>Analyzing note</span>}
                {!aiLoading && soapNote && soapNote}
                {!aiLoading && !soapNote && (
                  <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>SOAP note will appear here after generation.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><span className="sec-t">CDT Code Confidence Scores</span></div>
          {cdtConfidence.map((c, i) => (
            <div key={i} className="fin-r">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div><span className="badge bb" style={{ marginRight: 6 }}>{c.code}</span><span style={{ fontSize: 13 }}>{c.desc}</span></div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{c.confidence}%</span>
              </div>
              <div className="pw"><div className="pf pf-g" style={{ width: `${c.confidence}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

