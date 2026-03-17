'use client'
import { useState } from 'react'
import { usePatients, Patient } from '@/hooks/usePatients'

const TEETH_MAX = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
const TEETH_MAND = [32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17]

const getPD = (tooth: number, site: number): number => {
  const base: Record<number, number[]> = {
    3: [5,4,3], 5: [6,5,4], 14: [4,3,3], 19: [5,4,4], 30: [3,3,2],
    12: [3,2,3], 21: [4,3,4],
  }
  const t = base[tooth]
  if (t) return t[site % 3]
  return Math.floor(Math.random() * 3) + 2
}

const pdClass = (v: number) => v <= 3 ? 'pv-ok' : v <= 5 ? 'pv-warn' : 'pv-bad'

const SITES = ['DB', 'B', 'MB']

export default function Perio() {
  const [query, setQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const { patients } = usePatients(100)

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
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <input
            className="inp"
            placeholder="Search patient"
            value={query}
            style={{ width: 240 }}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true); if (!e.target.value) setSelectedPatient(null) }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filtered.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, minWidth: 260, maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}>
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
        {selectedPatient && (
          <div style={{ minWidth: 0, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
            <div className="av av-a">{selectedPatient.FName[0]}{selectedPatient.LName[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedPatient.FName} {selectedPatient.LName}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                {selectedPatient.Birthdate && !selectedPatient.Birthdate.startsWith('0001')
                  ? `DOB: ${new Date(selectedPatient.Birthdate).toLocaleDateString()}  -  ` : ''}
                Perio Active
              </div>
            </div>
            <span className="badge ba">Perio Active</span>
          </div>
        )}
        <div style={{ flex: 1 }} />
        <button className="btn btn-sm"> Prev Chart</button>
        <button className="btn btn-sm btn-p">Record Probing</button>
      </div>

      <div className="card" style={{ marginBottom: 14, overflowX: 'auto' }}>
        <div className="card-h">
          <div className="sec-t">Periodontal Chart  Maxillary</div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11, alignItems: 'center' }}>
            {[{ lbl: '13mm Normal', cls: 'pv-ok' }, { lbl: '45mm Watch', cls: 'pv-warn' }, { lbl: '6+mm Disease', cls: 'pv-bad' }].map(l => (
              <span key={l.lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className={l.cls} style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2 }} />
                {l.lbl}
              </span>
            ))}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 8px', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase' }}>Tooth</th>
              {SITES.map(s => <th key={s} style={{ padding: '2px 4px', fontSize: 9, color: 'var(--text3)', textAlign: 'center' }}>{s}</th>)}
              <th style={{ padding: '2px 8px', fontSize: 9, color: 'var(--text3)' }}>BOP</th>
              <th style={{ padding: '2px 8px', fontSize: 9, color: 'var(--text3)' }}>Recn</th>
              <th style={{ padding: '2px 8px', fontSize: 9, color: 'var(--text3)' }}>CAL</th>
            </tr>
          </thead>
          <tbody>
            {TEETH_MAX.map(tooth => {
              const pds = [0, 1, 2].map(s => getPD(tooth, s))
              const bop = pds.some(p => p >= 5)
              const rec = pds.some(p => p >= 5) ? 1 : 0
              const cal = Math.max(...pds) + rec
              return (
                <tr key={tooth} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '4px 8px', fontWeight: 700, fontFamily: 'var(--mono)', fontSize: 11 }}>#{tooth}</td>
                  {pds.map((pd, si) => (
                    <td key={si} style={{ padding: '3px 4px', textAlign: 'center' }}>
                      <span className={`perio-val ${pdClass(pd)}`} style={{ display: 'inline-block', minWidth: 24, borderRadius: 3, padding: '1px 4px' }}>{pd}</span>
                    </td>
                  ))}
                  <td style={{ padding: '3px 8px', textAlign: 'center', color: bop ? 'var(--red-400)' : 'var(--green-400)', fontWeight: 600, fontSize: 11 }}>{bop ? ' - ' : ' - '}</td>
                  <td style={{ padding: '3px 8px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10 }}>{rec}</td>
                  <td style={{ padding: '3px 8px', textAlign: 'center', fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 11, color: cal >= 6 ? 'var(--red-400)' : cal >= 4 ? 'var(--amber-400)' : 'var(--green-400)' }}>{cal}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h"><div className="sec-t">Periodontal Diagnosis & Treatment Plan</div></div>
          <div className="g3" style={{ marginBottom: 12 }}>
            <div className="metric"><div className="m-lbl">AAP Stage</div><div className="m-val warn">Stage II</div></div>
            <div className="metric"><div className="m-lbl">Grade</div><div className="m-val warn">Grade B</div></div>
            <div className="metric"><div className="m-lbl">Extent</div><div className="m-val">Generalized</div></div>
          </div>
          {[
            { tooth: 'UL', proc: 'Full Mouth SRP  Quadrant by Quadrant', code: 'D4341  -  4 quads  -  Est. 4 visits', fee: '$2,480', ins: 'Ins: ~$1,860  -  Pt: ~$620', status: 'pending' },
            { tooth: 'All', proc: 'Periodontal Re-Evaluation (8 weeks post-SRP)', code: 'D4910', fee: '$185', ins: 'Ins: ~$140', status: 'pending' },
          ].map((tx, i) => (
            <div key={i} className={`tx-item ${tx.status}`}>
              <div className="tx-tooth">{tx.tooth}</div>
              <div className="tx-info">
                <div className="tx-proc">{tx.proc}</div>
                <div className="tx-code">{tx.code}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="tx-fee">{tx.fee}</div>
                <div className="tx-ins">{tx.ins}</div>
              </div>
              <span className="badge ba">Pending Acceptance</span>
            </div>
          ))}
        </div>
        <div className="card fixed" style={{ width: 240 }}>
          <div className="card-h"><div className="sec-t">Hygiene Workflow</div></div>
          {[
            { label: 'Oral Cancer Screening', sub: 'Last: Feb 3, 2026  WNL', color: 'text3' },
            { label: 'Caries Risk Assessment', sub: 'Moderate  assessed Jan 15', color: 'amber-600' },
            { label: 'Fluoride Tx History', sub: 'D1208  -  3 in 2025', color: 'text3' },
            { label: 'Sealants', sub: 'None on record', color: 'text3' },
            { label: 'Tobacco Cessation', sub: 'Counseled  active smoker', color: 'amber-600' },
          ].map(it => (
            <div key={it.label} className="fin-r">
              <span style={{ fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <strong>{it.label}</strong>
                <span style={{ fontSize: 10, color: `var(--${it.color})` }}>{it.sub}</span>
              </span>
            </div>
          ))}
          <div className="divider" />
          <div className="fin-r">
            <span style={{ fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <strong>Recall Interval</strong>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>34 months (perio maintenance)</span>
            </span>
          </div>
          <button className="btn btn-p btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Schedule Perio Maintenance</button>
        </div>
      </div>
    </>
  )
}

