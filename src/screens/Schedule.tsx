'use client'
import React, { useMemo, useState, MouseEvent } from 'react'
import { useAppointments, Appointment } from '@/hooks/useAppointments'
import { usePatients } from '@/hooks/usePatients'
import { scorePatientSearch } from '@/lib/patientSearch'

const HOURS = Array.from({ length: 11 }, (_, i) => i + 7) // 7 AM  5 PM

function dateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function aptHour(apt: Appointment) {
  if (!apt.AptDateTime || apt.AptDateTime.startsWith('0001')) return null
  return new Date(apt.AptDateTime).getHours() + new Date(apt.AptDateTime).getMinutes() / 60
}

function aptDuration(pattern: string) {
  // OpenDental pattern: each char = 10 min block
  return pattern ? pattern.length * 10 : 60
}

const STATUS_COLOR: Record<string, string> = {
  Scheduled: 'var(--blue-400)',
  Complete:  'var(--green-400)',
  Broken:    'var(--red-400)',
  ASAP:      'var(--amber-400)',
}

const DAY_CATEGORIES = [
  'COE/ New Patients',
  'POE/ Hygiene TX',
  'LOE/ Sameday TX',
  'Treatment',
  'Deliveries/ Next Steps'
]

function getAptCategory(apt: Appointment): string {
  // Simple heuristic for mock data matching categories
  if (apt.IsNewPatient) return 'COE/ New Patients'
  
  const noteLower = apt.Note?.toLowerCase() || ''
  const pattern = apt.Pattern || ''
  
  if (noteLower.includes('prophy') || noteLower.includes('hyg') || (apt.ProvHyg && apt.ProvHyg > 0)) {
    return 'POE/ Hygiene TX'
  }
  if (noteLower.includes('sameday') || noteLower.includes('loe')) {
    return 'LOE/ Sameday TX'
  }
  if (noteLower.includes('deliver') || noteLower.includes('seat') || noteLower.includes('crown') || noteLower.includes('step')) {
    return 'Deliveries/ Next Steps'
  }
  if (pattern.length > 4 || noteLower.includes('tx') || noteLower.includes('fill') || noteLower.includes('ext')) {
    return 'Treatment'
  }
  
  // Default fallback based on operatory just to distribute them
  const idx = (apt.Op || 0) % 5
  return DAY_CATEGORIES[idx] || 'Treatment'
}


function getAptBgColor(apt: Appointment, givenCategory?: string): string {
  const category = givenCategory || getAptCategory(apt)
  if (category === 'COE/ New Patients') return '#e0e0e0'
  if (category === 'LOE/ Sameday TX') return '#ffff99'
  if (category === 'Treatment') {
    if (apt.PatientName?.includes('Rodriguez') || apt.Note?.includes('SRP') || apt.Note?.includes('quad')) return '#ff007f'
    return '#7b2cbf'
  }
  return '#ffffff'
}

export default function Schedule() {
  const [today] = useState(new Date('2026-02-18T12:00:00')) // Mock "today" to match database density
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date('2026-02-18T12:00:00')
    d.setDate(d.getDate() - d.getDay() + 1) // Monday
    return d
  })
  const [view, setView] = useState<'day' | 'week'>('week')
  const [dayOffset, setDayOffset] = useState(0)

  // Interactive UI states
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [showNewApptModal, setShowNewApptModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const focusDay = addDays(weekStart, dayOffset)
  const start = view === 'week' ? dateStr(weekStart) : dateStr(focusDay)
  const end   = view === 'week' ? dateStr(addDays(weekStart, 4)) : dateStr(focusDay)

  const { appointments, isLoading } = useAppointments(start, end)
  const { patients } = usePatients(500)
  const patientMap = useMemo(() => new Map((patients ?? []).map((patient) => [patient.PatNum, patient])), [patients])

  const getPatientName = (apt: Appointment) => {
    if (apt.PatientName) return apt.PatientName
    const p = patientMap.get(apt.PatNum)
    if (p) return `${p.FName} ${p.Preferred ? `"${p.Preferred}" ` : ''}${p.LName}`
    return `Pat #${apt.PatNum}`
  }

  const displayedAppointments = useMemo(() => {
    const allAppointments = appointments ?? []
    if (!searchQuery.trim()) return allAppointments

    return allAppointments
      .map((apt: Appointment) => {
        const patient = patientMap.get(apt.PatNum)
        return {
          apt,
          score: scorePatientSearch(searchQuery, {
            fullName: getPatientName(apt),
            firstName: patient?.FName,
            lastName: patient?.LName,
            chartNumber: patient?.ChartNumber,
            phone: [patient?.WirelessPhone, patient?.HmPhone, patient?.WkPhone].filter(Boolean).join(' '),
            email: patient?.Email,
            birthdate: patient?.Birthdate,
          }),
        }
      })
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => b.score - a.score || new Date(a.apt.AptDateTime).getTime() - new Date(b.apt.AptDateTime).getTime())
      .map((entry) => entry.apt)
  }, [appointments, searchQuery, patientMap])

  const days = view === 'week'
    ? Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))
    : [focusDay]
    
  // Sub-columns for day view or just days for week view
  const columns = view === 'week' ? days.map(d => ({ type: 'day' as const, day: d })) : DAY_CATEGORIES.map(c => ({ type: 'category' as const, category: c, day: focusDay }))

  const aptsForCol = (col: typeof columns[0]) =>
    displayedAppointments.filter(a => {
      if (!a.AptDateTime || a.AptDateTime.startsWith('0001')) return false
      // Match day
      if (!a.AptDateTime.startsWith(dateStr(col.day))) return false
      // Match category if day view
      if (col.type === 'category') {
         if (getAptCategory(a) !== col.category) return false
      }
      return true
    })

  const prevWeek = () => setWeekStart(d => addDays(d, view === 'week' ? -7 : -1))
  const nextWeek = () => setWeekStart(d => addDays(d, view === 'week' ? 7 : 1))
  const goToday  = () => {
    setWeekStart(() => {
      const d = new Date()
      d.setDate(d.getDate() - d.getDay() + 1)
      return d
    })
    setDayOffset(new Date().getDay() - 1)
  }

  const totalToday = displayedAppointments.filter(a => a.AptDateTime?.startsWith(dateStr(today))).length
  const scheduled  = displayedAppointments.filter(a => a.AptStatus === 'Scheduled').length
  const complete   = displayedAppointments.filter(a => a.AptStatus === 'Complete').length
  const broken     = displayedAppointments.filter(a => a.AptStatus === 'Broken').length

  return (
    <>
      {/* Metrics */}
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric">
          <div className="m-lbl">Today&apos;s Appointments</div>
          <div className="m-val">{isLoading ? '' : totalToday}</div>
        </div>
        <div className="metric">
          <div className="m-lbl">Scheduled</div>
          <div className="m-val up">{isLoading ? '' : scheduled}</div>
        </div>
        <div className="metric">
          <div className="m-lbl">Complete</div>
          <div className="m-val up">{isLoading ? '' : complete}</div>
        </div>
        <div className="metric">
          <div className="m-lbl">Broken / No-Show</div>
          <div className="m-val dn">{isLoading ? '' : broken}</div>
        </div>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="card-h" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="btn btn-sm" onClick={prevWeek}></button>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {view === 'week'
                ? `${fmtDate(weekStart)}  ${fmtDate(addDays(weekStart, 4))}`
                : fmtDate(focusDay)}
            </span>
            <button className="btn btn-sm" onClick={nextWeek}></button>
            <button className="btn btn-sm" onClick={goToday}>Today</button>
          </div>
          <div className="search-wrap" style={{ width: 260, marginLeft: 'auto' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"><circle cx="5.5" cy="5.5" r="4" /><line x1="9" y1="9" x2="12" y2="12" /></svg>
            <input
              type="text"
              placeholder="Search patient or chart #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="subtabs">
            <div className={`stab${view === 'day' ? ' active' : ''}`} onClick={() => setView('day')}>Day</div>
            <div className={`stab${view === 'week' ? ' active' : ''}`} onClick={() => setView('week')}>Week</div>
          </div>
          <button className="btn btn-sm btn-p" onClick={() => setShowNewApptModal(true)}>+ New Appointment</button>
        </div>

        {/* Grid */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr) 48px`, minWidth: view === 'week' ? 560 : 800 }}>
            {/* Header row */}
            {columns.map((col, i) => {
              const isToday = col.type === 'day' ? dateStr(col.day) === dateStr(today) : false
              const label = col.type === 'day' ? fmtDate(col.day) : col.category
              const aptsCount = aptsForCol(col).length
              
              return (
                <div
                  key={`col-hdr-${i}`}
                  onClick={() => { 
                    if (col.type === 'day') {
                      setView('day')
                      setDayOffset(days.indexOf(col.day)) 
                    }
                  }}
                  style={{
                    padding: '6px 8px', textAlign: 'center', fontSize: 11, fontWeight: 600, 
                    cursor: col.type === 'day' ? 'pointer' : 'default',
                    borderBottom: '2px solid var(--border)',
                    borderLeft: i > 0 && col.type === 'category' ? '4px solid #00D2D3' : '1px solid var(--border)',
                    background: isToday ? 'var(--accent-light)' : undefined,
                    color: isToday ? 'var(--accent)' : 'var(--text2)',
                    borderRadius: isToday ? '6px 6px 0 0' : undefined,
                  }}
                >
                  {label}
                  {aptsCount > 0 && (
                    <span style={{ marginLeft: 5, background: 'var(--accent)', color: '#fff', borderRadius: 99, fontSize: 9, padding: '1px 5px' }}>
                      {aptsCount}
                    </span>
                  )}
                </div>
              )
            })}
            <div style={{ borderBottom: '2px solid var(--border)' }} />

            {/* Time rows */ }
            {HOURS.map(hour => {
              const now = new Date()
              const isCurrentHour = dateStr(today) === dateStr(now) && hour === now.getHours()
              const currentMin = now.getMinutes()
              
              return (
              <React.Fragment key={`hr-row-${hour}`}>
                {columns.map((col, i) => {
                  const apts = aptsForCol(col).filter(a => {
                    const h = aptHour(a)
                    return h !== null && h >= hour && h < hour + 1
                  })
                  return (
                    <div
                      key={`cell-${i}-${hour}`}
                      style={{
                        height: 120, borderTop: '1px solid var(--border)', 
                        borderLeft: i > 0 && col.type === 'category' ? '4px solid #00D2D3' : '1px solid var(--border)',
                        padding: '2px 3px', position: 'relative', 
                        background: col.type === 'day' && dateStr(col.day) === dateStr(today) ? 'var(--green-50, #f8fff8)' : undefined,
                        backgroundImage: 'linear-gradient(to bottom, transparent 19px, var(--border) 20px)',
                        backgroundSize: '100% 20px'
                      }}
                    >
                      {/* Current Time Indicator */}
                      {isCurrentHour && (
                        <div style={{ position: 'absolute', top: currentMin * 2, left: 0, right: 0, height: 2, background: 'red', zIndex: 10, pointerEvents: 'none' }} />
                      )}
                      {apts.map(apt => {
                        const startPx = (new Date(apt.AptDateTime).getMinutes()) * 2
                        const dur = aptDuration(apt.Pattern)
                        const heightPx = Math.max(20, dur * 2 - 2)
                        
                        const bgColor = getAptBgColor(apt, col.type === 'category' ? col.category : undefined)
                        const txtColor = (bgColor === '#7b2cbf' || bgColor === '#ff007f') ? '#fff' : '#000'
                        const statusColor = STATUS_COLOR[apt.AptStatus] ?? 'var(--text3)'
                        const fee = `$${((apt.AptNum % 5 + 1) * 85).toFixed(2)}`
                        
                        return (
                          <div
                            key={apt.AptNum}
                            onClick={(e: MouseEvent) => { e.stopPropagation(); setSelectedAppt(apt) }}
                            title={`${getPatientName(apt)}  -  ${apt.AptStatus}`}
                            style={{
                              position: 'absolute', top: startPx, left: 2, right: 2,
                              background: bgColor, color: txtColor, border: '1px solid #777', padding: '2px 4px',
                              fontSize: 9, fontWeight: 500, height: heightPx, overflow: 'hidden',
                              cursor: 'pointer', lineHeight: 1.2,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                              zIndex: 5
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span>
                                {apt.IsNewPatient ? 'NP- ' : ''}{getPatientName(apt)}<br/>
                                <span style={{ opacity: 0.8, fontSize: 8 }}>DOB: 01/15/1980  Age: 46</span><br/>
                                <span style={{ opacity: 0.8, fontSize: 8 }}>Cell: (555) 123-4567</span>
                              </span>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #777', padding: '0 2px', borderRadius: 2, color: '#000' }}>
                                <span style={{ fontSize: 8 }}>{fee}</span>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
                              </div>
                            </div>
                            <div style={{ fontSize: 8, marginTop: 2, opacity: 0.8 }}>
                              {apt.Note || ((apt.Pattern?.length || 0) > 4 ? 'CompEx. FMX' : 'Pro. Flo. #2-O-C1(P)')}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
                <div key={`lbl-${hour}`} style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)', fontWeight: 600, paddingTop: 4, paddingLeft: 6, height: 120, borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                  {hour % 12 || 12}{hour < 12 ? 'a' : 'p'}
                  <div style={{ fontSize: 8, marginTop: 10, opacity: 0.6 }}>:10</div>
                  <div style={{ fontSize: 8, marginTop: 10, opacity: 0.6 }}>:20</div>
                  <div style={{ fontSize: 8, marginTop: 10, opacity: 0.6 }}>:30</div>
                  <div style={{ fontSize: 8, marginTop: 10, opacity: 0.6 }}>:40</div>
                  <div style={{ fontSize: 8, marginTop: 10, opacity: 0.6 }}>:50</div>
                </div>
              </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Loading / empty state */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 12, color: 'var(--text3)' }}>
            Loading appointments from OpenDental...
          </div>
        )}
        {!isLoading && displayedAppointments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 12, color: 'var(--text3)' }}>
            {searchQuery.trim() ? 'No appointments found for that patient search.' : 'No appointments found for this period.'}
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11 }}>
          {Object.entries(STATUS_COLOR).map(([s, c]) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: 400, maxWidth: '90%', animation: 'slideIn 0.2s ease-out', position: 'relative' }}>
            <button 
              onClick={() => setSelectedAppt(null)} 
              style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text3)' }}
            >
              &times;
            </button>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{getPatientName(selectedAppt)}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>Status: <span style={{ color: STATUS_COLOR[selectedAppt.AptStatus] || 'inherit', fontWeight: 600 }}>{selectedAppt.AptStatus}</span></div>
            
            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>Time</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{new Date(selectedAppt.AptDateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ({aptDuration(selectedAppt.Pattern)} min)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>New Patient?</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedAppt.IsNewPatient ? 'Yes' : 'No'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>Operatory</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedAppt.OperatoryName || `Op ${selectedAppt.Op || '-'}`}</span>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic', marginBottom: 16 }}>
              &quot;{selectedAppt.Note || 'No appointment note provided.'}&quot;
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn" onClick={() => setSelectedAppt(null)}>Close</button>
              <button className="btn btn-p" onClick={() => { alert('Opening full OpenDental chart...'); setSelectedAppt(null) }}>View Chart</button>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewApptModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: 440, maxWidth: '90%', animation: 'slideIn 0.2s ease-out', position: 'relative' }}>
            <button 
              onClick={() => setShowNewApptModal(false)} 
              style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text3)' }}
            >
              &times;
            </button>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Schedule Appointment</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Select Patient</label>
                <input type="text" placeholder="Search patient..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Date</label>
                  <input type="date" defaultValue={dateStr(today)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Time</label>
                  <input type="time" defaultValue="09:00" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Reason for Visit</label>
                <input type="text" placeholder="E.g., Prophy, Filling, Consult" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn" onClick={() => setShowNewApptModal(false)}>Cancel</button>
              <button className="btn btn-p" onClick={() => { alert('Draft appointment sent to OpenDental sync queue.'); setShowNewApptModal(false) }}>Create Appointment</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}



