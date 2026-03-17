'use client'
import { useState } from 'react'
import { usePatients, Patient } from '@/hooks/usePatients'
import { useProcedures, Procedure } from '@/hooks/useProcedures'

type Condition = 'healthy' | 'caries' | 'crown' | 'implant' | 'missing' | 'rct' | 'watch' | 'selected'

const INITIAL_CONDITIONS: Record<number, Condition> = {
  3: 'caries', 12: 'caries', 14: 'crown', 19: 'crown',
  30: 'watch', 1: 'missing', 16: 'missing', 32: 'missing',
}

const CONDITION_COLORS: Record<Condition, { fill: string; stroke: string }> = {
  healthy:  { fill: 'white',   stroke: '#8A887F' },
  caries:   { fill: '#FEF5E7', stroke: '#F0A020' },
  crown:    { fill: '#EAF2FD', stroke: '#3B8FE8' },
  implant:  { fill: '#E8F6F4', stroke: '#2AAFA0' },
  missing:  { fill: '#F6F5F2', stroke: '#D4D2CB' },
  rct:      { fill: '#FEF0F0', stroke: '#E84040' },
  watch:    { fill: '#F2EFFD', stroke: '#7C6FDD' },
  selected: { fill: '#E8F7F1', stroke: '#0D6E4E' },
}

const UPPER = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
const LOWER = [32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17]
const TOOLS = ['Caries','Crown','Implant','RCT','Watch','Missing','Healthy']

const EXISTING: { tooth:string; condition:string; cdt:string; date:string; provider:string }[] = [
  { tooth:'#3',  condition:'Mesial Caries  Dentin Depth',     cdt:'D2393 proposed',  date:'Mar 15, 2026', provider:'Dr. Lee' },
  { tooth:'#12', condition:'Distal-Occlusal Caries  Enamel',  cdt:'D2392 proposed',  date:'Mar 15, 2026', provider:'Dr. Lee' },
  { tooth:'#14', condition:'PFM Crown  Existing Restoration',  cdt:'D2750 existing',  date:'Jan 12, 2024', provider:'Dr. Lee' },
  { tooth:'#19', condition:'PFM Crown  Existing Restoration',  cdt:'D2750 existing',  date:'Oct 3, 2023',  provider:'Dr. Patel' },
  { tooth:'#30', condition:'Incipient Caries  Watch',          cdt:'D1208 fluoride',  date:'Mar 15, 2026', provider:'Dr. Lee' },
  { tooth:'#1',  condition:'Missing  Unerupted/Extracted',     cdt:'N/A',             date:'On record',    provider:'' },
]

export default function Charting() {
  const [conditions, setConditions] = useState<Record<number, Condition>>(INITIAL_CONDITIONS)
  const [activeTool, setActiveTool] = useState('Caries')
  const [selectedTooth, setSelectedTooth] = useState<number | null>(14)
  const [notes, setNotes] = useState('')
  const [cdtInput, setCdtInput] = useState('')
  const [query, setQuery] = useState('')
  const [selectedPatNum, setSelectedPatNum] = useState<number | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const { patients } = usePatients(100)
  const { procedures, isLoading: procsLoading } = useProcedures(selectedPatNum)

  const filtered = query.length >= 2
    ? (patients ?? []).filter(p =>
        `${p.FName} ${p.LName}`.toLowerCase().includes(query.toLowerCase()) ||
        p.ChartNumber?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  const selectPatient = (p: Patient) => {
    setSelectedPatNum(p.PatNum)
    setSelectedPatient(p)
    setQuery(`${p.FName} ${p.LName}`)
    setShowDropdown(false)
  }

  const existingProcs = (procedures ?? []).filter(p => p.ProcStatus === 2 || p.ProcStatus === 6)

  const toolToCondition: Record<string, Condition> = {
    'Caries':'caries','Crown':'crown','Implant':'implant','RCT':'rct',
    'Watch':'watch','Missing':'missing','Healthy':'healthy',
  }

  const handleTooth = (n: number) => {
    setSelectedTooth(n)
    setConditions(prev => ({ ...prev, [n]: toolToCondition[activeTool] ?? 'healthy' }))
  }

  const renderRow = (teeth: number[], y: number) => teeth.map((n, i) => {
    const x = 20 + i * 46
    const rawCond: Condition = selectedTooth === n ? 'selected' : (conditions[n] ?? 'healthy')
    const cond: Condition = rawCond in CONDITION_COLORS ? rawCond : 'healthy'
    const { fill, stroke } = CONDITION_COLORS[cond]
    return (
      <g key={n} className="tooth" onClick={() => handleTooth(n)} style={{ cursor:'pointer' }}>
        <ellipse cx={x} cy={y} rx={17} ry={22} fill={fill} stroke={stroke}
          strokeWidth={selectedTooth===n ? 2 : 1}
          strokeDasharray={cond==='missing' ? '3 2' : undefined}
          style={{ transition:'all .15s' }} />
        <text x={x} y={y+32} textAnchor="middle" fontSize={8} fill="var(--text3)" fontFamily="var(--mono)">{n}</text>
      </g>
    )
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="row" style={{ justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
        <div style={{ position:'relative' }}>
          <input
            className="inp"
            placeholder="Search patient"
            value={query}
            style={{ width:240 }}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true); if (!e.target.value) { setSelectedPatNum(null); setSelectedPatient(null) } }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filtered.length > 0 && (
            <div style={{ position:'absolute', top:'100%', left:0, zIndex:20, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, minWidth:260, maxHeight:220, overflowY:'auto', boxShadow:'0 4px 16px rgba(0,0,0,.12)' }}>
              {filtered.map(p => (
                <div key={p.PatNum} style={{ padding:'8px 12px', cursor:'pointer', fontSize:13, borderBottom:'1px solid var(--border)' }} onMouseDown={() => selectPatient(p)}>
                  {p.FName} {p.LName}
                  {p.Birthdate && !p.Birthdate.startsWith('0001') && (
                    <span style={{ fontSize:10, color:'var(--text3)', marginLeft:8 }}>{new Date(p.Birthdate).toLocaleDateString()}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedPatient && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 12px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10 }}>
            <div className="av av-b">{selectedPatient.FName[0]}{selectedPatient.LName[0]}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>{selectedPatient.FName} {selectedPatient.LName}</div>
              <div style={{ fontSize:10, color:'var(--text3)' }}>
                {selectedPatient.Birthdate && !selectedPatient.Birthdate.startsWith('0001')
                  ? `DOB: ${new Date(selectedPatient.Birthdate).toLocaleDateString()}` : ''}
              </div>
            </div>
          </div>
        )}
        <div style={{ flex:1 }} />
        <div className="row" style={{ gap:8 }}>
          <button className="btn btn-sm">Prev Visit</button>
          <button className="btn btn-sm">All Visits</button>
          <button className="btn btn-sm btn-p">+ New Finding</button>
        </div>
      </div>

      <div style={{ display:'flex', gap:16 }}>
        <div className="card" style={{ flex:1 }}>
          <div className="card-h">
            <span className="sec-t">Odontogram  Interactive Chart</span>
            <div className="row" style={{ gap:5, flexWrap:'wrap' }}>
              {TOOLS.map(t => (
                <span key={t} className={`badge ${activeTool===t ? 'bg' : 'bx'}`}
                  style={{ cursor:'pointer' }} onClick={() => setActiveTool(t)}>{t}</span>
              ))}
            </div>
          </div>

          <svg viewBox="0 0 760 200" width="100%" style={{ display:'block', margin:'0 auto' }}>
            <g>{renderRow(UPPER, 76)}</g>
            <line x1="10" y1="110" x2="750" y2="110" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 3" />
            <g>{renderRow(LOWER, 140)}</g>
          </svg>

          <div style={{ display:'flex', gap:10, marginTop:10, flexWrap:'wrap' }}>
            {Object.entries(CONDITION_COLORS).filter(([k]) => k !== 'selected').map(([cond, { fill, stroke }]) => (
              <span key={cond} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11 }}>
                <span style={{ width:12, height:12, borderRadius:3, background:fill, border:`2px solid ${stroke}`, display:'inline-block' }} />
                {cond.charAt(0).toUpperCase()+cond.slice(1)}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16, width:260 }}>
          <div className="card">
            <div className="card-h"><span className="sec-t">Clinical Notes</span></div>
            <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6 }}>Visit: March 15, 2026  -  Dr. James Lee</div>
            <textarea className="inp" rows={5} style={{ fontSize:12, resize:'none', lineHeight:1.6, width:'100%' }}
              value={notes} onChange={e => setNotes(e.target.value)} />
            <div style={{ display:'flex', gap:6, marginTop:8 }}>
              <span className="badge br">Penicillin Allergy</span>
              <span className="badge ba">HTN</span>
              <span className="badge ba">Blood Thinner</span>
            </div>
            <button className="btn btn-sm btn-p" style={{ width:'100%', justifyContent:'center', marginTop:8 }}>Save & Sign Note</button>
          </div>

          <div className="card">
            <div className="card-h"><span className="sec-t">Procedure Entry (CDT)</span></div>
            <div className="fgrp">
              <label className="flbl">CDT Code / Procedure</label>
              <input className="inp" placeholder="e.g. D2393 or search..." value={cdtInput}
                onChange={e => setCdtInput(e.target.value)} style={{ fontSize:12 }} />
            </div>
            <div style={{ fontSize:11, color:'var(--text2)', marginBottom:8 }}>
              Common today: D2750  -  D2393  -  D2392  -  D4341  -  D1208
            </div>
            <button className="btn btn-sm btn-p" style={{ width:'100%', justifyContent:'center' }}>+ Add to Treatment Plan</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <span className="sec-t">Conditions List</span>
          <span className="badge bb">{selectedPatNum ? existingProcs.length : EXISTING.length} findings</span>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Tooth</th><th>Condition / Description</th><th>CDT Code</th><th>Date</th><th>Surface</th>
              </tr>
            </thead>
            <tbody>
              {!selectedPatNum && EXISTING.map((e,i) => (
                <tr key={i}>
                  <td style={{ fontWeight:700, fontFamily:'var(--mono)' }}>{e.tooth}</td>
                  <td>{e.condition}</td>
                  <td><span className="badge bx" style={{ fontSize:11 }}>{e.cdt}</span></td>
                  <td style={{ fontSize:12, color:'var(--text2)' }}>{e.date}</td>
                  <td style={{ fontSize:12 }}>{e.provider}</td>
                </tr>
              ))}
              {procsLoading && (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:'30px 0', color:'var(--text3)' }}>Loading procedures</td></tr>
              )}
              {!procsLoading && selectedPatNum && existingProcs.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:'30px 0', color:'var(--text3)' }}>No completed procedures on record.</td></tr>
              )}
              {existingProcs.map(p => (
                <tr key={p.ProcNum}>
                  <td style={{ fontWeight:700, fontFamily:'var(--mono)' }}>{p.ToothNum || ''}</td>
                  <td>{p.Descript || ''}</td>
                  <td><span className="badge bx" style={{ fontSize:11 }}>{p.ProcCode}</span></td>
                  <td style={{ fontSize:12, color:'var(--text2)' }}>
                    {p.ProcDate && !p.ProcDate.startsWith('0001') ? new Date(p.ProcDate).toLocaleDateString() : ''}
                  </td>
                  <td style={{ fontSize:12 }}>{p.Surf || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

