'use client'
import { useEffect, useMemo, useState } from 'react'
import { usePatients, Patient } from '@/hooks/usePatients'
import { useProcedures, Procedure } from '@/hooks/useProcedures'
import { scorePatientSearch } from '@/lib/patientSearch'

type Condition = 'healthy' | 'caries' | 'crown' | 'implant' | 'missing' | 'rct' | 'watch' | 'selected'
type VisitMode = 'latest' | 'previous' | 'all'

type Finding = {
  id: number
  tooth: string
  description: string
  code: string
  date: string
  surface: string
}

type TreatmentPlanItem = {
  id: string
  tooth: string
  code: string
  description: string
  createdAt: string
}

const INITIAL_CONDITIONS: Record<number, Condition> = {
  3: 'caries', 12: 'caries', 14: 'crown', 19: 'crown',
  30: 'watch', 1: 'missing', 16: 'missing', 32: 'missing',
}

const CONDITION_COLORS: Record<Condition, { fill: string; stroke: string }> = {
  healthy: { fill: '#FFFFFF', stroke: '#8A887F' },
  caries: { fill: '#FEF5E7', stroke: '#F0A020' },
  crown: { fill: '#EAF2FD', stroke: '#3B8FE8' },
  implant: { fill: '#E8F6F4', stroke: '#2AAFA0' },
  missing: { fill: '#F6F5F2', stroke: '#D4D2CB' },
  rct: { fill: '#FEF0F0', stroke: '#E84040' },
  watch: { fill: '#F2EFFD', stroke: '#7C6FDD' },
  selected: { fill: '#E8F7F1', stroke: '#0D6E4E' },
}

const CONDITION_LABELS: Record<Exclude<Condition, 'selected'>, { label: string; help: string }> = {
  healthy: { label: 'Healthy', help: 'No active concern noted' },
  caries: { label: 'Needs filling', help: 'Decay or restorative concern' },
  crown: { label: 'Existing crown', help: 'Full coverage restoration on file' },
  implant: { label: 'Implant', help: 'Implant-related restoration present' },
  missing: { label: 'Missing', help: 'Tooth missing or extracted' },
  rct: { label: 'Root canal', help: 'Endodontic treatment on file' },
  watch: { label: 'Watch area', help: 'Monitor at next visit' },
}

const UPPER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
const LOWER = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17]
const TOOLS = ['Caries', 'Crown', 'Implant', 'RCT', 'Watch', 'Missing', 'Healthy']

const EXISTING: Finding[] = [
  { id: 1, tooth: '#3', description: 'Mesial caries, dentin depth', code: 'D2393 proposed', date: 'Mar 15, 2026', surface: 'M' },
  { id: 2, tooth: '#12', description: 'Distal-occlusal caries, enamel', code: 'D2392 proposed', date: 'Mar 15, 2026', surface: 'DO' },
  { id: 3, tooth: '#14', description: 'PFM crown, existing restoration', code: 'D2750 existing', date: 'Jan 12, 2024', surface: 'Full' },
  { id: 4, tooth: '#19', description: 'PFM crown, existing restoration', code: 'D2750 existing', date: 'Oct 3, 2023', surface: 'Full' },
  { id: 5, tooth: '#30', description: 'Incipient caries, monitor', code: 'D1208 fluoride', date: 'Mar 15, 2026', surface: 'O' },
  { id: 6, tooth: '#1', description: 'Missing tooth on record', code: 'N/A', date: 'On record', surface: '' },
]

function getProcCode(proc: Procedure) {
  return proc.ProcCode ?? proc.procCode ?? ''
}

function inferCondition(proc: Procedure): Condition {
  const code = getProcCode(proc)
  if (!code) return 'watch'
  if (/^D6/.test(code)) return 'implant'
  if (/^D33/.test(code)) return 'rct'
  if (/^D27|^D29/.test(code)) return 'crown'
  if (/^D21|^D23|^D24|^D25/.test(code)) return 'caries'
  if (/^D7(1|2)/.test(code)) return 'missing'
  return 'watch'
}

function formatFinding(proc: Procedure): Finding {
  const code = getProcCode(proc)
  return {
    id: proc.ProcNum,
    tooth: proc.ToothNum ? `#${proc.ToothNum}` : 'General',
    description: (proc.Descript ?? proc.descript ?? code) || 'Procedure',
    code: code || 'N/A',
    date: proc.ProcDate && !proc.ProcDate.startsWith('0001') ? new Date(proc.ProcDate).toLocaleDateString() : '',
    surface: proc.Surf || '',
  }
}

function conditionFromTool(tool: string): Condition {
  const map: Record<string, Condition> = {
    Caries: 'caries',
    Crown: 'crown',
    Implant: 'implant',
    RCT: 'rct',
    Watch: 'watch',
    Missing: 'missing',
    Healthy: 'healthy',
  }
  return map[tool] ?? 'healthy'
}

function normalizeDate(dateText: string) {
  if (!dateText || dateText === 'On record') return ''
  const parsed = new Date(dateText)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

export default function Charting() {
  const [manualConditions, setManualConditions] = useState<Record<number, Condition>>({})
  const [activeTool, setActiveTool] = useState('Caries')
  const [selectedTooth, setSelectedTooth] = useState<number | null>(14)
  const [notes, setNotes] = useState('')
  const [postedNote, setPostedNote] = useState('')
  const [postedAt, setPostedAt] = useState('')
  const [cdtInput, setCdtInput] = useState('')
  const [query, setQuery] = useState('')
  const [selectedPatNum, setSelectedPatNum] = useState<number | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [visitMode, setVisitMode] = useState<VisitMode>('latest')
  const [statusMessage, setStatusMessage] = useState('')
  const [treatmentPlanItems, setTreatmentPlanItems] = useState<TreatmentPlanItem[]>([])

  const { patients } = usePatients(100)
  const { procedures, isLoading: procsLoading } = useProcedures(selectedPatNum)

  const filtered = query.trim().length >= 1
    ? (patients ?? [])
        .map((patient) => ({
          patient,
          score: scorePatientSearch(query, {
            fullName: `${patient.FName} ${patient.LName}`,
            firstName: patient.FName,
            lastName: patient.LName,
            chartNumber: patient.ChartNumber,
            phone: [patient.WirelessPhone, patient.HmPhone, patient.WkPhone].filter(Boolean).join(' '),
            email: patient.Email,
            birthdate: patient.Birthdate,
          }),
        }))
        .filter((entry) => entry.score >= 0)
        .sort((a, b) => b.score - a.score || a.patient.LName.localeCompare(b.patient.LName) || a.patient.FName.localeCompare(b.patient.FName))
        .slice(0, 8)
        .map((entry) => entry.patient)
    : []

  const existingProcs = useMemo(
    () => (procedures ?? []).filter((p) => (p.ProcStatus === 2 || p.ProcStatus === 'C') && !!p.ToothNum),
    [procedures]
  )

  const allFindings = selectedPatNum
    ? existingProcs.map(formatFinding).sort((a, b) => normalizeDate(b.date).localeCompare(normalizeDate(a.date)))
    : EXISTING

  const visitDates = useMemo(() => {
    const unique = new Set(allFindings.map((finding) => finding.date).filter(Boolean))
    return [...unique].sort((a, b) => normalizeDate(b).localeCompare(normalizeDate(a)))
  }, [allFindings])

  const activeVisitDate = visitMode === 'all'
    ? null
    : visitMode === 'latest'
      ? visitDates[0] ?? null
      : visitDates[1] ?? visitDates[0] ?? null

  const findings = useMemo(() => {
    if (!activeVisitDate) return allFindings
    return allFindings.filter((finding) => finding.date === activeVisitDate)
  }, [activeVisitDate, allFindings])

  const odConditions = useMemo(() => {
    const sourceFindings = findings.length > 0 ? findings : allFindings
    const byTooth: Record<number, Condition> = {}
    for (const finding of sourceFindings) {
      const toothNum = Number((finding.tooth || '').replace('#', ''))
      if (!Number.isFinite(toothNum)) continue
      const matchingProc = existingProcs.find((proc) => proc.ProcNum === finding.id)
      byTooth[toothNum] = matchingProc ? inferCondition(matchingProc) : byTooth[toothNum] ?? 'watch'
    }
    return byTooth
  }, [existingProcs, findings, allFindings])

  const effectiveConditions = selectedPatNum
    ? { ...odConditions, ...manualConditions }
    : { ...INITIAL_CONDITIONS, ...manualConditions }

  const selectedCondition = selectedTooth ? effectiveConditions[selectedTooth] ?? 'healthy' : null
  const selectedConditionText = selectedCondition && selectedCondition !== 'selected'
    ? CONDITION_LABELS[selectedCondition as Exclude<Condition, 'selected'>]
    : null
  const selectedToothFindings = selectedTooth ? findings.filter((finding) => finding.tooth === `#${selectedTooth}`) : []
  const selectedFinding = selectedToothFindings[0] ?? null
  const selectedConditionTitle = selectedFinding?.description ?? selectedConditionText?.label ?? 'No condition recorded'
  const selectedConditionDetail = selectedFinding
    ? `Conditions list says: ${selectedFinding.description}${selectedFinding.surface ? `, surface ${selectedFinding.surface}` : ''}${selectedFinding.code && selectedFinding.code !== 'N/A' ? `, code ${selectedFinding.code}` : ''}.`
    : (selectedConditionText?.help ?? 'Choose a tooth to view staff guidance.')

  const chartStats = useMemo(() => {
    const counts = { needsAttention: 0, missing: 0, restored: 0, monitored: 0 }
    Object.values(effectiveConditions).forEach((condition) => {
      if (condition === 'caries' || condition === 'rct') counts.needsAttention += 1
      if (condition === 'missing') counts.missing += 1
      if (condition === 'crown' || condition === 'implant') counts.restored += 1
      if (condition === 'watch') counts.monitored += 1
    })
    return counts
  }, [effectiveConditions])

  const generatedNote = useMemo(() => {
    if (!selectedPatient) {
      return 'Select a patient to load procedures and generate a chart note for staff.'
    }

    const patientName = `${selectedPatient.FName} ${selectedPatient.LName}`.trim()
    const toothLabel = selectedTooth ? `Tooth #${selectedTooth}` : 'General chart review'
    const recentFinding = selectedTooth ? selectedFinding : findings[0]
    const conditionLine = recentFinding
      ? `Condition list entry: ${recentFinding.description}${recentFinding.surface ? `, surface ${recentFinding.surface}` : ''}${recentFinding.code && recentFinding.code !== 'N/A' ? `, code ${recentFinding.code}` : ''}.`
      : `Condition list entry: ${selectedConditionText?.label ?? 'No focused condition'}${selectedConditionText?.help ? `. ${selectedConditionText.help}.` : ''}`

    const visitLine = activeVisitDate ? `Visit date: ${activeVisitDate}.` : 'Visit scope: All visits.'

    return [
      `Patient: ${patientName}`,
      visitLine,
      `Focus: ${toothLabel}`,
      conditionLine,
      'Staff action: Review with provider, confirm treatment plan, and document patient discussion before checkout.',
    ].join('\n')
  }, [activeVisitDate, findings, selectedConditionText, selectedFinding, selectedPatient, selectedTooth])

  useEffect(() => {
    setNotes(generatedNote)
  }, [generatedNote])

  useEffect(() => {
    if (!statusMessage) return undefined
    const timeout = window.setTimeout(() => setStatusMessage(''), 2800)
    return () => window.clearTimeout(timeout)
  }, [statusMessage])

  const selectPatient = (patient: Patient) => {
    setSelectedPatNum(patient.PatNum)
    setSelectedPatient(patient)
    setQuery(`${patient.FName} ${patient.LName}`)
    setShowDropdown(false)
    setManualConditions({})
    setSelectedTooth(null)
    setPostedNote('')
    setPostedAt('')
    setVisitMode('latest')
    setTreatmentPlanItems([])
    setStatusMessage(`Loaded chart for ${patient.FName} ${patient.LName}.`)
  }

  const handleTooth = (tooth: number) => {
    setSelectedTooth(tooth)
  }

  const applyActiveToolToSelectedTooth = () => {
    if (!selectedTooth) {
      setStatusMessage('Select a tooth before applying a condition.')
      return
    }
    setManualConditions((prev) => ({ ...prev, [selectedTooth]: conditionFromTool(activeTool) }))
    setStatusMessage(`Applied ${activeTool} to tooth #${selectedTooth}.`)
  }

  const showLatestVisit = () => {
    setVisitMode('previous')
    if (visitDates[1]) {
      setStatusMessage(`Showing previous visit from ${visitDates[1]}.`)
    } else {
      setStatusMessage('No earlier visit found, staying on the latest visit.')
    }
  }

  const showAllVisits = () => {
    setVisitMode('all')
    setStatusMessage('Showing findings from all visits.')
  }

  const postClinicalNote = () => {
    const noteToPost = notes.trim() || generatedNote
    setNotes(noteToPost)
    setPostedNote(noteToPost)
    setPostedAt(new Date().toLocaleString())
    setStatusMessage('Clinical note posted to the chart panel.')
  }

  const addToTreatmentPlan = () => {
    const description = cdtInput.trim() || selectedFinding?.description || selectedConditionTitle
    const code = cdtInput.trim() || selectedFinding?.code || 'Manual entry'
    const tooth = selectedTooth ? `#${selectedTooth}` : (selectedFinding?.tooth || 'General')
    const newItem: TreatmentPlanItem = {
      id: `${Date.now()}-${treatmentPlanItems.length}`,
      tooth,
      code,
      description,
      createdAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    }
    setTreatmentPlanItems((prev) => [newItem, ...prev].slice(0, 4))
    setCdtInput('')
    setStatusMessage(`${tooth} added to the treatment plan queue.`)
  }

  const renderRow = (teeth: number[], y: number) => teeth.map((tooth, index) => {
    const x = 36 + index * 40
    const rawCond: Condition = selectedTooth === tooth ? 'selected' : (effectiveConditions[tooth] ?? 'healthy')
    const cond: Condition = rawCond in CONDITION_COLORS ? rawCond : 'healthy'
    const { fill, stroke } = CONDITION_COLORS[cond]
    return (
      <g key={tooth} onClick={() => handleTooth(tooth)} style={{ cursor: 'pointer' }}>
        <ellipse
          cx={x}
          cy={y}
          rx={15}
          ry={20}
          fill={fill}
          stroke={stroke}
          strokeWidth={selectedTooth === tooth ? 2.4 : 1.2}
          strokeDasharray={cond === 'missing' ? '3 2' : undefined}
          style={{ transition: 'all .15s' }}
        />
        <text x={x} y={y + 31} textAnchor="middle" fontSize={8} fill="var(--text3)" fontFamily="var(--mono)">{tooth}</text>
      </g>
    )
  })

  const summaryBadges = [
    { label: 'Needs attention', value: chartStats.needsAttention, cls: 'ba' },
    { label: 'Watch', value: chartStats.monitored, cls: 'bp' },
    { label: 'Restored', value: chartStats.restored, cls: 'bb' },
    { label: 'Missing', value: chartStats.missing, cls: 'br' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {statusMessage && (
        <div className="alert al-s" style={{ marginBottom: 0 }}>
          <span>OK</span>
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="row" style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 0 }}>
        <div style={{ position: 'relative', minWidth: 260, flex: '0 1 320px' }}>
          <input
            className="inp"
            placeholder="Search patient"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowDropdown(true)
              if (!e.target.value) {
                setSelectedPatNum(null)
                setSelectedPatient(null)
                setManualConditions({})
                setPostedNote('')
                setPostedAt('')
                setVisitMode('latest')
                setTreatmentPlanItems([])
              }
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filtered.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20, width: '100%', background: '#fff', border: '1px solid var(--border)', borderRadius: 12, maxHeight: 240, overflowY: 'auto', boxShadow: '0 14px 34px rgba(0,0,0,.12)' }}>
              {filtered.map((patient) => (
                <div key={patient.PatNum} style={{ padding: '10px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)' }} onMouseDown={() => selectPatient(patient)}>
                  <div style={{ fontWeight: 700 }}>{patient.FName} {patient.LName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {patient.ChartNumber ? `Chart #${patient.ChartNumber}` : 'No chart #'}
                    {patient.Birthdate && !patient.Birthdate.startsWith('0001') ? ` • DOB ${new Date(patient.Birthdate).toLocaleDateString()}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPatient && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div className="av av-b">{selectedPatient.FName[0]}{selectedPatient.LName[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedPatient.FName} {selectedPatient.LName}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {selectedPatient.ChartNumber ? `Chart #${selectedPatient.ChartNumber}` : 'Chart number unavailable'}
                {selectedPatient.Birthdate && !selectedPatient.Birthdate.startsWith('0001') ? ` • DOB ${new Date(selectedPatient.Birthdate).toLocaleDateString()}` : ''}
              </div>
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />
        <button className="btn btn-sm" onClick={showLatestVisit}>Prev Visit</button>
        <button className="btn btn-sm" onClick={showAllVisits}>All Visits</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, .95fr)', gap: 16, alignItems: 'start' }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>Odontogram</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
                Click a tooth to review it. Apply a condition only when you want to update the chart.
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                {visitMode === 'all' ? 'Showing all visits' : activeVisitDate ? `Current view: ${activeVisitDate}` : 'Current view: latest visit'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {summaryBadges.map((badge) => (
                <span key={badge.label} className={`badge ${badge.cls}`} style={{ padding: '5px 10px', fontSize: 11 }}>
                  {badge.label}: {badge.value}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {TOOLS.map((tool) => (
              <button
                key={tool}
                className={`btn btn-sm ${activeTool === tool ? 'btn-p' : ''}`}
                style={{ borderRadius: 999, minWidth: 72, justifyContent: 'center' }}
                onClick={() => {
                  setActiveTool(tool)
                  setStatusMessage(`${tool} tool selected.`)
                }}
              >
                {tool}
              </button>
            ))}
          </div>

          <div style={{ padding: '18px 18px 14px', borderRadius: 16, background: '#FBFAF7', border: '1px solid #E7E2D8' }}>
            <svg viewBox="0 0 720 190" width="100%" style={{ display: 'block' }}>
              <g>{renderRow(UPPER, 72)}</g>
              <line x1="18" y1="104" x2="702" y2="104" stroke="#E0D9CC" strokeWidth="1" strokeDasharray="4 4" />
              <g>{renderRow(LOWER, 138)}</g>
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) minmax(0, 1fr)', gap: 14, marginTop: 14, alignItems: 'start' }}>
            <div style={{ padding: 16, borderRadius: 14, background: '#F8F5EE', border: '1px solid #E2DBCF' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: 10 }}>Tooth Focus</div>
              {selectedTooth ? (
                <>
                  <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>#{selectedTooth}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>{selectedConditionTitle}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginTop: 8 }}>{selectedConditionDetail}</div>
                  <button className="btn btn-sm btn-p" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={applyActiveToolToSelectedTooth}>
                    Apply {activeTool} To Tooth
                  </button>
                </>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>Click a tooth to review its conditions and prepare a note for the team.</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              {Object.entries(CONDITION_LABELS).map(([condition, meta]) => {
                const { fill, stroke } = CONDITION_COLORS[condition as Exclude<Condition, 'selected'>]
                return (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => {
                      const matchingTool = TOOLS.find((tool) => conditionFromTool(tool) === condition)
                      if (matchingTool) {
                        setActiveTool(matchingTool)
                        setStatusMessage(`${meta.label} is ready to apply.`)
                      }
                    }}
                    style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 10, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: fill, border: `2px solid ${stroke}`, flex: '0 0 auto', marginTop: 2 }} />
                    <span>
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>{meta.label}</span>
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--text3)', lineHeight: 1.45 }}>{meta.help}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <div>
                <div className="sec-t">Clinical Notes</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                  {selectedPatient ? 'Use the suggested note as the handoff draft, then post the final version.' : 'Select a patient to generate a staff-ready chart note.'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {selectedPatNum ? <span className="badge bg">OD Loaded</span> : <span className="badge bx">Demo View</span>}
                {selectedTooth ? <span className="badge ba">Tooth #{selectedTooth}</span> : null}
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 12, background: '#F7F4EE', border: '1px solid #E7DED0', marginBottom: 12 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7A6C57', marginBottom: 8 }}>Suggested Note</div>
              <div style={{ fontSize: 12, lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--text2)' }}>{generatedNote}</div>
            </div>

            <textarea
              className="inp"
              rows={8}
              style={{ fontSize: 12, resize: 'none', lineHeight: 1.65, width: '100%', background: '#fff' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button className="btn btn-sm btn-p" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={postClinicalNote}>
              Post Clinical Note
            </button>

            {postedNote && (
              <div style={{ marginTop: 12, background: '#F4FBF8', border: '1px solid #B7E2D0', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#0D6E4E' }}>Posted To Chart</div>
                  {postedAt ? <span className="badge bb">{postedAt}</span> : null}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{postedNote}</div>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div className="card-h" style={{ marginBottom: 8 }}>
              <span className="sec-t">Procedure Entry (CDT)</span>
              <span className="badge bx">{findings.length} findings</span>
            </div>
            <div className="fgrp">
              <label className="flbl">CDT Code / Procedure</label>
              <input className="inp" placeholder="e.g. D2393 or search..." value={cdtInput} onChange={(e) => setCdtInput(e.target.value)} style={{ fontSize: 12, background: '#fff' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 10 }}>
              {selectedPatNum ? `Loaded ${findings.length} procedure${findings.length === 1 ? '' : 's'} from Open Dental` : 'Search a patient to pull procedure history from Open Dental'}
            </div>
            <button className="btn btn-sm btn-p" style={{ width: '100%', justifyContent: 'center' }} onClick={addToTreatmentPlan}>
              + Add To Treatment Plan
            </button>
            {treatmentPlanItems.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {treatmentPlanItems.map((item) => (
                  <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '9px 10px', background: '#FAFAF8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong style={{ fontSize: 12 }}>{item.tooth}</strong>
                      <span className="badge bg">{item.createdAt}</span>
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>{item.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{item.code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div className="card-h" style={{ marginBottom: 8 }}>
          <div>
            <span className="sec-t">Conditions List</span>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Click a row to focus the matching tooth in the chart.</div>
          </div>
          <span className="badge bb">{findings.length} findings</span>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Tooth</th><th>Condition / Description</th><th>CDT Code</th><th>Date</th><th>Surface</th>
              </tr>
            </thead>
            <tbody>
              {procsLoading && selectedPatNum && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text3)' }}>Loading procedures from Open Dental...</td></tr>
              )}
              {!selectedPatNum && findings.map((finding) => (
                <tr key={finding.id} onClick={() => setSelectedTooth(Number(finding.tooth.replace('#', '')))} style={{ cursor: 'pointer', background: selectedTooth === Number(finding.tooth.replace('#', '')) ? '#F7F4EE' : undefined }}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{finding.tooth}</td>
                  <td>{finding.description}</td>
                  <td><span className="badge bx" style={{ fontSize: 11 }}>{finding.code}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{finding.date}</td>
                  <td style={{ fontSize: 12 }}>{finding.surface}</td>
                </tr>
              ))}
              {!procsLoading && selectedPatNum && findings.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text3)' }}>No completed tooth procedures found for this patient.</td></tr>
              )}
              {selectedPatNum && findings.map((finding) => {
                const toothNum = Number((finding.tooth || '').replace('#', ''))
                const isToothRow = finding.tooth.startsWith('#') && Number.isFinite(toothNum)
                return (
                  <tr key={finding.id} onClick={() => isToothRow ? setSelectedTooth(toothNum) : null} style={{ cursor: isToothRow ? 'pointer' : 'default', background: selectedTooth === toothNum ? '#F7F4EE' : undefined }}>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{finding.tooth}</td>
                    <td>{finding.description}</td>
                    <td><span className="badge bx" style={{ fontSize: 11 }}>{finding.code}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{finding.date}</td>
                    <td style={{ fontSize: 12 }}>{finding.surface}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
