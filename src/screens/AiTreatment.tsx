'use client'
import { useState } from 'react'
import { usePatients, Patient } from '@/hooks/usePatients'
import { useAI } from '@/hooks/useAI'

export default function AiTreatment() {
  const [accepted, setAccepted] = useState<Record<number, 'accepted' | 'overridden'>>({})
  const [query, setQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [aiInsight, setAiInsight] = useState<string | null>(null)

  const { patients } = usePatients(100)
  const { generateContent, isLoading: aiLoading } = useAI({
    systemInstruction: 'You are an AI dental treatment advisor. Based on patient clinical data, generate concise treatment recommendations prioritized by urgency and insurance maximization. Include CDT code, rationale, evidence basis, estimated value, and insurance coverage notes. Keep analysis under 300 words.',
  })

  const filtered = query.length >= 2
    ? (patients ?? []).filter(p =>
        `${p.FName} ${p.LName}`.toLowerCase().includes(query.toLowerCase()) ||
        p.ChartNumber?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  const selectPatient = (p: Patient) => {
    setSelectedPatient(p)
    setQuery(`${p.FName} ${p.LName}`)
    setShowDropdown(false)
    setAiInsight(null)
  }

  const analyzePatient = async () => {
    if (!selectedPatient) return
    const dob = selectedPatient.Birthdate && !selectedPatient.Birthdate.startsWith('0001')
      ? new Date(selectedPatient.Birthdate).toLocaleDateString() : 'unknown'
    const prompt = `Analyze this dental patient and provide treatment recommendations:\nPatient: ${selectedPatient.FName} ${selectedPatient.LName}, DOB: ${dob}\nChart #: ${selectedPatient.ChartNumber || 'N/A'}\n\nBased on typical clinical patterns for this patient profile, what treatment should be prioritized? Include specific CDT codes, sequencing for insurance benefit maximization, and any clinical risks to address.`
    const result = await generateContent(prompt)
    if (result) setAiInsight(result)
  }

  const recommendations = [
    {
      id: 1,
      cdt: 'D2740',
      title: 'Crown #14 (PFM  already planned)',
      action: 'Confirm proceed',
      rationale: 'Occlusal caries to dentin confirmed on PA. Cuspal involvement present. Crown prep already scheduled.',
      evidence: 'ADA Clinical Practice Guidelines 2024  -  3 peer-reviewed studies',
      value: 1240,
      priority: 'High',
      coverage: '50%  Est. patient portion $620',
    },
    {
      id: 2,
      cdt: 'D0180',
      title: 'Perio Re-evaluation #3 (pocket depth 45mm)',
      action: 'Recommend probing at next visit',
      rationale: 'Pocket depth 45mm noted at #3 mesial. BOP present. Recommend comprehensive perio probing at next visit.',
      evidence: 'AAP Staging & Grading Guidelines 2024',
      value: 195,
      priority: 'Medium',
      coverage: '100% diagnostic  $0 patient est.',
    },
    {
      id: 3,
      cdt: 'D4341',
      title: 'SRP Consideration  subgingival calculus #2830',
      action: 'Review at next visit',
      rationale: 'Subgingival calculus noted #2830 with 4mm pocketing. No bone loss on current FMX. Monitor or initiate SRP.',
      evidence: 'AAP guidelines recommend SRP for 4mm+ pocketing with calculus',
      value: 560,
      priority: 'Medium',
      coverage: '80%  Est. patient portion $112',
    },
    {
      id: 4,
      cdt: 'D2392',
      title: 'Composite #19 MOD  watch, early decay',
      action: 'Monitor  no immediate action',
      rationale: 'Early enamel/dentin lesion visible on BWX. No pain reported. Monitor with 6-month recall and improve OH.',
      evidence: 'CAMBRA protocol; early lesion suitable for watchful waiting',
      value: 310,
      priority: 'Low',
      coverage: '80%  Est. patient portion $62',
    },
  ]

  const currentPlan = [
    { seq: 1, cdt: 'D0150', proc: 'Comprehensive Exam', date: 'Mar 15', value: 185 },
    { seq: 2, cdt: 'D2740', proc: 'Crown #14 Prep', date: 'Mar 15', value: 1240 },
    { seq: 3, cdt: 'D2740', proc: 'Crown #14 Seat', date: 'Mar 29', value: 0 },
    { seq: 4, cdt: 'D1110', proc: 'Prophy', date: 'Mar 29', value: 185 },
  ]

  const aiPlan = [
    { seq: 1, cdt: 'D0150', proc: 'Comprehensive Exam', date: 'Mar 15', value: 185, note: '' },
    { seq: 2, cdt: 'D0180', proc: 'Perio Eval (insurance max reset)', date: 'Mar 15', value: 195, note: 'AI: bill before crown  maximizes benefit' },
    { seq: 3, cdt: 'D2740', proc: 'Crown #14 Prep', date: 'Mar 22', value: 1240, note: 'AI: shift 1 week  pre-auth approved' },
    { seq: 4, cdt: 'D4341', proc: 'SRP Quad 4 (if probing confirms)', date: 'Mar 29', value: 280, note: 'AI: same visit as prophy saves copay' },
    { seq: 5, cdt: 'D1110', proc: 'Prophy', date: 'Mar 29', value: 185, note: '' },
  ]

  const similarOutcomes = {
    profile: 'Male, 42, Stage I perio, crown #14, smoker, DM Type 2',
    sampleSize: 284,
    proceededCrown: 89,
    avgDuration: 4.2,
    complications: 6,
    satisfactionScore: 4.4,
  }

  const acceptReject = (id: number, val: 'accepted' | 'overridden') => {
    setAccepted(prev => ({ ...prev, [id]: val }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Patient selector */}
      <div className="card">
        <div className="card-h">
          <span className="sec-t">Patient</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                className="inp"
                placeholder="Search patient"
                value={query}
                style={{ width: 260 }}
                onChange={e => { setQuery(e.target.value); setShowDropdown(true); if (!e.target.value) { setSelectedPatient(null); setAiInsight(null) } }}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && filtered.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, minWidth: 280, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}>
                  {filtered.map(p => (
                    <div key={p.PatNum} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)' }} onMouseDown={() => selectPatient(p)}>
                      {p.FName} {p.LName}
                      {p.Birthdate && !p.Birthdate.startsWith('0001') && (
                        <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>{new Date(p.Birthdate).toLocaleDateString()}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-sm btn-p" onClick={analyzePatient} disabled={!selectedPatient || aiLoading}>
              {aiLoading ? '* Analyzing' : '* AI Analyze'}
            </button>
          </div>
        </div>
        {selectedPatient && (
          <div style={{ display: 'flex', gap: 20, marginTop: 4, flexWrap: 'wrap' }}>
            {[
              ['Name', `${selectedPatient.FName} ${selectedPatient.LName}`],
              ...(selectedPatient.Birthdate && !selectedPatient.Birthdate.startsWith('0001')
                ? [['DOB', new Date(selectedPatient.Birthdate).toLocaleDateString()]] : []),
              ['Chart #', selectedPatient.ChartNumber || ''],
              ['Phone', selectedPatient.WirelessPhone || selectedPatient.HmPhone || ''],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>{lbl}: </span>
                <span style={{ fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {aiInsight && (
        <div className="ai-card">
          <div className="ai-head">
            <div className="ai-icon">*</div>
            <div>
              <div className="ai-title">AI Treatment Advisor  {selectedPatient?.FName} {selectedPatient?.LName}</div>
              <div className="ai-sub">AI-generated analysis based on patient profile. Review with clinical judgment before acting.</div>
            </div>
            <span className="badge bg" style={{ marginLeft: 'auto' }}>Live AI</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7, color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>{aiInsight}</div>
        </div>
      )}

      {!selectedPatient && (
        <div className="ai-card">
          <div className="ai-head">
            <div className="ai-icon">*</div>
            <div>
              <div className="ai-title">AI Treatment Advisor</div>
              <div className="ai-sub">Search for a patient above, then click AI Analyze to generate personalized treatment recommendations.</div>
            </div>
          </div>
        </div>
      )}

      <div className="g2">
        <div className="card">
          <div className="card-h"><span className="sec-t">AI Recommendations</span></div>
          {recommendations.map((r, i) => {
            const state = accepted[r.id]
            return (
              <div key={r.id} style={{ borderBottom: i < recommendations.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                  <div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', marginRight: 6 }}>{r.cdt}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green-600)', fontWeight: 700 }}>${r.value}</span>
                    <span className={`badge ${r.priority === 'High' ? 'br' : r.priority === 'Medium' ? 'ba' : 'bx'}`}>{r.priority}</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, lineHeight: 1.5 }}>{r.rationale}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>
                  <span style={{ marginRight: 12 }}>Evidence: {r.evidence}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--blue-600)', marginBottom: 8 }}>Insurance: {r.coverage}</div>
                {state ? (
                  <span className={`badge ${state === 'accepted' ? 'bg' : 'bx'}`}>{state === 'accepted' ? 'OK Accepted' : ' -  Overridden'}</span>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-sm btn-p" onClick={() => acceptReject(r.id, 'accepted')}>Accept</button>
                    <button className="btn btn-sm" onClick={() => acceptReject(r.id, 'overridden')}>Override</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><span className="sec-t">Treatment Plan Optimizer</span><span className="badge bp">Insurance Max</span></div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 6 }}>CURRENT SEQUENCE</div>
              {currentPlan.map((p, i) => (
                <div key={i} className="fin-r">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--text3)', width: 14 }}>{p.seq}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{p.proc}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{p.cdt}  -  {p.date}</div>
                    </div>
                  </div>
                  {p.value > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>${p.value}</span>}
                </div>
              ))}
            </div>
            <div className="divider" />
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-600)', marginBottom: 6 }}>AI-OPTIMIZED SEQUENCE</div>
              {aiPlan.map((p, i) => (
                <div key={i} className="fin-r" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--text3)', width: 14 }}>{p.seq}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{p.proc}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{p.cdt}  -  {p.date}</div>
                      </div>
                    </div>
                    {p.value > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>${p.value}</span>}
                  </div>
                  {p.note && <div style={{ fontSize: 10, color: 'var(--green-600)', marginLeft: 22 }}>{p.note}</div>}
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--green-50)', borderRadius: 6, padding: 10, marginTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>AI-optimized insurance recovery</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: 'var(--green-600)' }}>+$195</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>additional benefit utilized</div>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><span className="sec-t">Similar Case Outcomes</span><span className="badge bb">{similarOutcomes.sampleSize} cases</span></div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Profile: {similarOutcomes.profile}</div>
            {[
              { lbl: 'Proceeded with crown', val: `${similarOutcomes.proceededCrown}%`, color: 'var(--green-600)' },
              { lbl: 'Avg crown lifespan', val: `${similarOutcomes.avgDuration} years`, color: 'var(--text2)' },
              { lbl: 'Complication rate', val: `${similarOutcomes.complications}%`, color: 'var(--text2)' },
              { lbl: 'Patient satisfaction', val: `${similarOutcomes.satisfactionScore}/5`, color: 'var(--text2)' },
            ].map((row, i) => (
              <div key={i} className="fin-r">
                <span style={{ fontSize: 12 }}>{row.lbl}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: row.color }}>{row.val}</span>
              </div>
            ))}
            <div className="alert al-i" style={{ marginTop: 10, fontSize: 12 }}>
              Patients with similar perio+caries profile: 89% proceeded with crown; avg outcome 4.2 years before replacement.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

