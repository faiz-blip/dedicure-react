'use client'
import React, { useMemo, useState, useEffect } from 'react'
import { usePatient } from '@/hooks/usePatients'
import { useAppointments } from '@/hooks/useAppointments'
import { useProcedures } from '@/hooks/useProcedures'
import { useClaims } from '@/hooks/useClaims'
import { backendUrl } from '@/lib/config'

interface CodeEntry { code: string; desc: string }

// Fetch and cache CDT procedure codes from OD, indexed by both ProcCode string AND CodeNum
function useProcedureCodes(): { byCode: Record<string, CodeEntry>; byNum: Record<number, CodeEntry> } {
  const [byCode, setByCode] = useState<Record<string, CodeEntry>>({})
  const [byNum,  setByNum]  = useState<Record<number, CodeEntry>>({})
  useEffect(() => {
    fetch(backendUrl('/api/od/procedurecodes'))
      .then(r => r.ok ? r.json() : [])
      .then((data: { CodeNum: number; ProcCode: string; Descript: string; AbbrDesc?: string }[]) => {
        if (!Array.isArray(data)) return
        const bc: Record<string, CodeEntry> = {}
        const bn: Record<number, CodeEntry> = {}
        for (const c of data) {
          const entry: CodeEntry = { code: c.ProcCode, desc: c.Descript || c.AbbrDesc || c.ProcCode }
          if (c.ProcCode) bc[c.ProcCode] = entry
          if (c.CodeNum)  bn[c.CodeNum]  = entry
        }
        setByCode(bc)
        setByNum(bn)
      })
      .catch(() => {})
  }, [])
  return { byCode, byNum }
}

// Resolve proc code + description from a procedure record (handles mixed OD casing)
function resolveProc(proc: { ProcCode?: string; procCode?: string; Descript?: string; descript?: string; CodeNum?: number; ProcNum?: number },
                     byCode: Record<string, { code: string; desc: string }>,
                     byNum:  Record<number, { code: string; desc: string }>) {
  const rawCode = proc.ProcCode || proc.procCode || ''
  const rawDesc = proc.Descript || proc.descript || ''

  // Look up by CodeNum first (most reliable), then by code string
  const fromNum  = proc.CodeNum ? byNum[proc.CodeNum]  : null
  const fromCode = rawCode      ? byCode[rawCode]      : null
  const entry    = fromNum ?? fromCode

  const code = rawCode || entry?.code || ''
  // Skip generic internal codes like ~GRP~ when showing to the user
  const displayCode = (code && !code.startsWith('~')) ? code : ''
  const desc = rawDesc && rawDesc !== code ? rawDesc : (entry?.desc || '')
  const displayDesc = (desc && !desc.startsWith('~')) ? desc : ''

  return { code: displayCode, desc: displayDesc }
}

// ─── Status helpers ───────────────────────────────────────────────────────────
const APT_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  Complete:    { label: 'Complete',   bg: '#dcfce7', text: '#15803d' },
  Scheduled:   { label: 'Scheduled',  bg: '#ede9fe', text: '#6d28d9' },
  UnschedList: { label: 'Waitlist',   bg: '#fef9c3', text: '#a16207' },
  ASAP:        { label: 'ASAP',       bg: '#fef9c3', text: '#a16207' },
  Broken:      { label: 'Broken',     bg: '#fee2e2', text: '#b91c1c' },
}

const CLAIM_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  U: { label: 'Unsent',   bg: '#fef9c3', text: '#a16207' },
  S: { label: 'Sent',     bg: '#ede9fe', text: '#6d28d9' },
  R: { label: 'Received', bg: '#dcfce7', text: '#15803d' },
  D: { label: 'Denied',   bg: '#fee2e2', text: '#b91c1c' },
  P: { label: 'Preauth',  bg: '#e0f2fe', text: '#0369a1' },
}

const PROC_STATUS_NUM: Record<number, { label: string; bg: string; text: string }> = {
  0: { label: 'Unset',     bg: '#f3f4f6', text: '#6b7280' },
  1: { label: 'Planned',   bg: '#fef9c3', text: '#a16207' },
  2: { label: 'Complete',  bg: '#dcfce7', text: '#15803d' },
  3: { label: 'Existing',  bg: '#ede9fe', text: '#6d28d9' },
  4: { label: 'Existing',  bg: '#ede9fe', text: '#6d28d9' },
  5: { label: 'Referred',  bg: '#e0f2fe', text: '#0369a1' },
  6: { label: 'Deleted',   bg: '#f3f4f6', text: '#9ca3af' },
  7: { label: 'Condition', bg: '#f3f4f6', text: '#6b7280' },
}
const PROC_STATUS_STR: Record<string, { label: string; bg: string; text: string }> = {
  TP: { label: 'Planned',  bg: '#fef9c3', text: '#a16207' },
  C:  { label: 'Complete', bg: '#dcfce7', text: '#15803d' },
  EO: { label: 'Existing', bg: '#ede9fe', text: '#6d28d9' },
  EC: { label: 'Existing', bg: '#ede9fe', text: '#6d28d9' },
  R:  { label: 'Referred', bg: '#e0f2fe', text: '#0369a1' },
  D:  { label: 'Deleted',  bg: '#f3f4f6', text: '#9ca3af' },
}
function getProcSt(raw: number | string) {
  if (typeof raw === 'string') return PROC_STATUS_STR[raw] ?? { label: String(raw) || '—', bg: '#f3f4f6', text: '#6b7280' }
  return PROC_STATUS_NUM[raw] ?? { label: `#${raw}`, bg: '#f3f4f6', text: '#6b7280' }
}
function getAptSt(s: string) {
  return APT_STATUS[s] ?? { label: s, bg: '#f3f4f6', text: '#6b7280' }
}
function getClaimSt(s: string) {
  return CLAIM_STATUS[s] ?? { label: s, bg: '#f3f4f6', text: '#6b7280' }
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function calcAge(bdate: string) {
  if (!bdate || bdate.startsWith('0001')) return null
  const today = new Date(), birth = new Date(bdate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}
function fmtDate(iso: string) {
  if (!iso || iso.startsWith('0001')) return '—'
  return new Date(iso).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(iso: string) {
  if (!iso || iso.startsWith('0001')) return ''
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
function fmtMoney(n: number | null | undefined) {
  if (n == null) return '—'
  return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function Badge({ bg, text, label }: { bg: string; text: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '.03em', background: bg, color: text, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

function StatBox({ value, label }: { value: number | string; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 20px', borderLeft: '1px solid rgba(0,0,0,.08)' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#18180F', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#9A9890', textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 3 }}>{label}</div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PatientDetail({ patNum }: { patNum: number }) {
  const [tab, setTab] = useState<'overview' | 'procedures' | 'claims'>('overview')

  const { patient, isLoading: loadingPat } = usePatient(patNum)

  const now = new Date()
  const aptStart = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()).toISOString().split('T')[0]
  const aptEnd   = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0]
  const { appointments, isLoading: loadingApts } = useAppointments(aptStart, aptEnd)

  const patApts = useMemo(
    () => (appointments ?? [])
      .filter(a => a.PatNum === patNum)
      .sort((a, b) => new Date(b.AptDateTime).getTime() - new Date(a.AptDateTime).getTime()),
    [appointments, patNum]
  )

  const { byCode: procByCode, byNum: procByNum } = useProcedureCodes()

  const { procedures, isLoading: loadingProcs } = useProcedures(patNum)
  const sortedProcs = useMemo(
    () => [...(procedures ?? [])].sort((a, b) => b.ProcDate.localeCompare(a.ProcDate)),
    [procedures]
  )

  // Build a map from AptNum → appointment note for "reason" display
  const aptNoteMap = useMemo(() => {
    const m: Record<number, string> = {}
    for (const a of patApts) if (a.AptNum && a.Note) m[a.AptNum] = a.Note
    return m
  }, [patApts])

  const { claims, isLoading: loadingClaims } = useClaims()
  const patClaims = useMemo(
    () => (claims ?? [])
      .filter(c => c.PatNum === patNum)
      .sort((a, b) => (b.DateService ?? '').localeCompare(a.DateService ?? '')),
    [claims, patNum]
  )

  const age         = patient ? calcAge(patient.Birthdate) : null
  const displayName = patient
    ? [patient.Preferred || patient.FName, patient.LName].filter(Boolean).join(' ')
    : `Patient #${patNum}`

  const upcomingApts = patApts.filter(a => new Date(a.AptDateTime) >= now)
  const pastApts     = patApts.filter(a => new Date(a.AptDateTime) <  now)
  const plannedProcs = sortedProcs.filter(p => p.ProcStatus === 1 || p.ProcStatus === 'TP')
  const totalFees    = patClaims.reduce((s, c) => s + (c.ClaimFee || 0), 0)

  const TABS = [
    { id: 'overview',    label: 'Overview' },
    { id: 'procedures',  label: `Procedures (${sortedProcs.length})` },
    { id: 'claims',      label: `Claims (${patClaims.length})` },
  ] as const

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '0 0 60px' }}>

      {/* ── Back ── */}
      <button
        onClick={() => window.history.back()}
        style={{ fontSize: 12, color: '#9A9890', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        ← Back
      </button>

      {/* ── Patient header ── */}
      {loadingPat ? (
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A9890', fontSize: 13 }}>Loading…</div>
      ) : patient ? (
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.09)', borderRadius: 14, padding: '24px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>

          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0D6E4E 0%, #1A9E72 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, flexShrink: 0, letterSpacing: '-.5px',
            boxShadow: '0 2px 8px rgba(13,110,78,.25)',
          }}>
            {(patient.Preferred || patient.FName)?.[0]?.toUpperCase()}{patient.LName?.[0]?.toUpperCase()}
          </div>

          {/* Name block — takes up golden-ratio proportion of remaining width */}
          <div style={{ flex: '1.618', minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#18180F', letterSpacing: '-.3px', lineHeight: 1.15 }}>{displayName}</div>
            <div style={{ fontSize: 12, color: '#9A9890', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {age != null && <span>Age {age}</span>}
              {patient.Birthdate && !patient.Birthdate.startsWith('0001') && <span>DOB {fmtDate(patient.Birthdate)}</span>}
              {patient.ChartNumber && <span>Chart #{patient.ChartNumber}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: '#5a584f', marginTop: 8 }}>
              {(patient.WirelessPhone || patient.HmPhone) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 13 }}>📱</span>{patient.WirelessPhone || patient.HmPhone}
                </span>
              )}
              {patient.Email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 13 }}>✉</span>{patient.Email}
                </span>
              )}
              {patient.Address && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 13 }}>📍</span>{patient.Address}, {patient.City} {patient.State} {patient.Zip}
                </span>
              )}
            </div>
          </div>

          {/* Stats — take up the remaining 1/golden-ratio proportion */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 0 }}>
            <StatBox value={patApts.length}     label="Visits" />
            <StatBox value={plannedProcs.length} label="Planned" />
            <StatBox value={patClaims.length}   label="Claims" />
            <StatBox value={fmtMoney(totalFees)} label="Total Billed" />
          </div>
        </div>
      ) : (
        <div style={{ padding: 32, textAlign: 'center', color: '#dc2626', fontSize: 13 }}>Patient not found.</div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'rgba(0,0,0,.05)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? '#18180F' : '#9A9890',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
              transition: 'all .15s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.618fr 1fr', gap: 16, alignItems: 'start' }}>

          {/* Appointments (main column) */}
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.09)', borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9A9890', marginBottom: 16 }}>Appointments</div>

            {upcomingApts.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', marginBottom: 8 }}>Upcoming</div>
                {upcomingApts.map(apt => {
                  const st = getAptSt(apt.AptStatus)
                  return (
                    <div key={apt.AptNum} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '1px solid #f3f2ef' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: '#ede9fe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#6d28d9', lineHeight: 1 }}>{new Date(apt.AptDateTime).getDate()}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase' }}>{new Date(apt.AptDateTime).toLocaleDateString('default', { month: 'short' })}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#18180F' }}>{fmtTime(apt.AptDateTime)}</div>
                        <div style={{ fontSize: 11, color: '#9A9890', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.Note || 'Routine Visit'} · Prov {apt.ProvNum}</div>
                      </div>
                      <Badge {...st} />
                    </div>
                  )
                })}
                <div style={{ height: 16 }} />
              </>
            )}

            {loadingApts ? (
              <div style={{ fontSize: 12, color: '#9A9890', padding: '20px 0' }}>Loading appointments…</div>
            ) : pastApts.length === 0 && upcomingApts.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9A9890', padding: '20px 0' }}>No appointment history found.</div>
            ) : pastApts.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9A9890', marginBottom: 8 }}>Past</div>
                {pastApts.slice(0, 10).map(apt => {
                  const st = getAptSt(apt.AptStatus)
                  return (
                    <div key={apt.AptNum} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid #f3f2ef' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f3f2ef', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#5a584f', lineHeight: 1 }}>{new Date(apt.AptDateTime).getDate()}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#9A9890', textTransform: 'uppercase' }}>{new Date(apt.AptDateTime).toLocaleDateString('default', { month: 'short' })}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#5a584f' }}>{fmtDate(apt.AptDateTime)} · {fmtTime(apt.AptDateTime)}</div>
                        <div style={{ fontSize: 11, color: '#9A9890', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.Note || 'Routine Visit'} · Prov {apt.ProvNum}</div>
                      </div>
                      <Badge {...st} />
                    </div>
                  )
                })}
              </>
            )}
          </div>

          {/* Sidebar (1fr) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Recent procedures snapshot */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.09)', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9A9890', marginBottom: 12 }}>Recent Procedures</div>
              {loadingProcs ? (
                <div style={{ fontSize: 12, color: '#9A9890' }}>Loading…</div>
              ) : sortedProcs.length === 0 ? (
                <div style={{ fontSize: 12, color: '#9A9890' }}>None on record.</div>
              ) : sortedProcs.slice(0, 6).map(proc => {
                const st     = getProcSt(proc.ProcStatus)
                const { code, desc } = resolveProc(proc, procByCode, procByNum)
                const reason = proc.AptNum ? aptNoteMap[proc.AptNum] : ''
                return (
                  <div key={proc.ProcNum} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid #f3f2ef', gap: 8 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#18180F' }}>{code || `Proc #${proc.ProcNum}`}</div>
                      <div style={{ fontSize: 11, color: '#5a584f', marginTop: 1 }}>{desc || '—'}</div>
                      {reason && <div style={{ fontSize: 10, color: '#9A9890', marginTop: 1, fontStyle: 'italic' }}>"{reason}"</div>}
                      <div style={{ fontSize: 10, color: '#B0AEA6', marginTop: 1 }}>{fmtDate(proc.ProcDate)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{fmtMoney(proc.ProcFee)}</div>
                      <Badge {...st} />
                    </div>
                  </div>
                )
              })}
              {sortedProcs.length > 6 && (
                <button onClick={() => setTab('procedures')} style={{ marginTop: 10, fontSize: 11, color: '#0D6E4E', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                  View all {sortedProcs.length} procedures →
                </button>
              )}
            </div>

            {/* Insurance snapshot */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.09)', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9A9890', marginBottom: 12 }}>Insurance</div>
              {loadingClaims ? (
                <div style={{ fontSize: 12, color: '#9A9890' }}>Loading…</div>
              ) : patClaims.length === 0 ? (
                <div style={{ fontSize: 12, color: '#9A9890' }}>No claims on file.</div>
              ) : (
                <>
                  {patClaims.slice(0, 3).map(c => {
                    const st = getClaimSt(c.ClaimStatus)
                    return (
                      <div key={c.ClaimNum} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f2ef', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#18180F' }}>#{c.ClaimNum}</div>
                          <div style={{ fontSize: 10, color: '#9A9890' }}>{fmtDate(c.DateService)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{fmtMoney(c.ClaimFee)}</div>
                          <Badge {...st} />
                        </div>
                      </div>
                    )
                  })}
                  {patClaims.length > 3 && (
                    <button onClick={() => setTab('claims')} style={{ marginTop: 10, fontSize: 11, color: '#0D6E4E', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                      View all {patClaims.length} claims →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Procedures tab ── */}
      {tab === 'procedures' && (
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.09)', borderRadius: 14, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9A9890', marginBottom: 16 }}>Procedure History</div>
          {loadingProcs ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9A9890', fontSize: 13 }}>Loading…</div>
          ) : sortedProcs.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9A9890', fontSize: 13 }}>No procedures on record.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f2ef' }}>
                  {['Code', 'Description', 'Date', 'Tooth · Surf', 'Provider', 'Fee', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0 12px 10px 0', fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#9A9890', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedProcs.map(proc => {
                  const st = getProcSt(proc.ProcStatus)
                  const { code, desc } = resolveProc(proc, procByCode, procByNum)
                  const reason = proc.AptNum ? aptNoteMap[proc.AptNum] : ''
                  return (
                    <tr key={proc.ProcNum} style={{ borderBottom: '1px solid #f3f2ef' }}>
                      <td style={{ padding: '10px 12px 10px 0', fontWeight: 700, color: '#18180F', whiteSpace: 'nowrap' }}>{code || `#${proc.ProcNum}`}</td>
                      <td style={{ padding: '10px 12px 10px 0', maxWidth: 280 }}>
                        <div style={{ color: '#18180F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc || '—'}</div>
                        {reason && <div style={{ fontSize: 10, color: '#9A9890', fontStyle: 'italic', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{reason}"</div>}
                      </td>
                      <td style={{ padding: '10px 12px 10px 0', color: '#9A9890', whiteSpace: 'nowrap' }}>{fmtDate(proc.ProcDate)}</td>
                      <td style={{ padding: '10px 12px 10px 0', color: '#9A9890', whiteSpace: 'nowrap' }}>
                        {[proc.ToothNum ? `#${proc.ToothNum}` : '', proc.Surf || ''].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td style={{ padding: '10px 12px 10px 0', color: '#9A9890' }}>{proc.provAbbr || (proc.ProvNum ? `Prov ${proc.ProvNum}` : '—')}</td>
                      <td style={{ padding: '10px 12px 10px 0', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtMoney(proc.ProcFee)}</td>
                      <td style={{ padding: '10px 0 10px 0' }}><Badge {...st} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Claims tab ── */}
      {tab === 'claims' && (
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.09)', borderRadius: 14, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9A9890', marginBottom: 16 }}>Insurance Claims</div>
          {loadingClaims ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9A9890', fontSize: 13 }}>Loading…</div>
          ) : patClaims.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9A9890', fontSize: 13 }}>No claims on file.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f2ef' }}>
                  {['Claim #', 'Service', 'Sent', 'Fee', 'Est. Ins.', 'Paid', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0 12px 10px 0', fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#9A9890', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patClaims.map(c => {
                  const st = getClaimSt(c.ClaimStatus)
                  return (
                    <tr key={c.ClaimNum} style={{ borderBottom: '1px solid #f3f2ef' }}>
                      <td style={{ padding: '11px 12px 11px 0', fontWeight: 700 }}>#{c.ClaimNum}</td>
                      <td style={{ padding: '11px 12px 11px 0', color: '#9A9890', whiteSpace: 'nowrap' }}>{fmtDate(c.DateService)}</td>
                      <td style={{ padding: '11px 12px 11px 0', color: '#9A9890', whiteSpace: 'nowrap' }}>{fmtDate(c.DateSent)}</td>
                      <td style={{ padding: '11px 12px 11px 0', fontWeight: 600 }}>{fmtMoney(c.ClaimFee)}</td>
                      <td style={{ padding: '11px 12px 11px 0', color: '#5a584f' }}>{fmtMoney(c.InsPayEst)}</td>
                      <td style={{ padding: '11px 12px 11px 0', fontWeight: 700, color: c.InsPayAmt > 0 ? '#15803d' : '#9A9890' }}>{c.InsPayAmt > 0 ? fmtMoney(c.InsPayAmt) : '—'}</td>
                      <td style={{ padding: '11px 0 11px 0' }}><Badge {...st} /></td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #f3f2ef' }}>
                  <td colSpan={3} style={{ padding: '10px 0', fontSize: 11, color: '#9A9890', fontWeight: 600 }}>{patClaims.length} claims</td>
                  <td style={{ padding: '10px 12px 10px 0', fontWeight: 800, fontSize: 14 }}>{fmtMoney(totalFees)}</td>
                  <td style={{ padding: '10px 12px 10px 0', fontWeight: 700, color: '#5a584f' }}>{fmtMoney(patClaims.reduce((s, c) => s + (c.InsPayEst || 0), 0))}</td>
                  <td style={{ padding: '10px 0', fontWeight: 800, fontSize: 14, color: '#15803d' }}>{fmtMoney(patClaims.reduce((s, c) => s + (c.InsPayAmt || 0), 0))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

    </div>
  )
}

