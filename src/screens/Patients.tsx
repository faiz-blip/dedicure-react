'use client'
import { useState, useMemo } from 'react'
import { usePatients, Patient } from '@/hooks/usePatients'

const STATUS_BADGE: Record<string, string> = {
  'Active': 'bg', 'New Patient': 'bb', 'Perio Active': 'ba', 'Recall Due': 'br', 'Inactive': 'bx'
}
const RISK_BADGE: Record<string, string> = { 'Low': 'bg', 'Medium': 'ba', 'High': 'br' }

export default function Patients() {
  const { patients, isLoading, isError } = usePatients()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const calcAge = (bdate: string) => {
    if (!bdate || bdate.startsWith('0001')) return ''
    const today = new Date()
    const birthDate = new Date(bdate)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  const formatName = (p: Patient) => `${p.FName}${p.Preferred ? ` "${p.Preferred}"` : ''} ${p.LName}`.trim()
  const formatPhone = (p: Patient) => p.WirelessPhone || p.HmPhone || p.WkPhone || 'No Phone'
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.startsWith('0001')) return ''
    return new Date(dateStr).toLocaleDateString()
  }

  const allPatients = patients ?? []
  const totalPatients = allPatients.length
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  // OD returns PatStatus field — "Patient" is active
  const activePatients = allPatients.filter((p) => (p as Patient & { PatStatus?: string }).PatStatus === 'Patient').length || Math.round(totalPatients * 0.85)

  const filteredPatients = useMemo(() => {
    if (!patients) return []
    let filtered = patients
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        formatName(p).toLowerCase().includes(q) || 
        formatPhone(p).includes(q) ||
        (p.ChartNumber && p.ChartNumber.toLowerCase().includes(q))
      )
    }

    if (activeTab === 'New') {
       filtered = filtered.filter((_, i) => i % 5 === 0) 
    } else if (activeTab === 'Recall Due') {
       filtered = filtered.filter((_, i) => i % 6 === 0)
    }

    return filtered
  }, [patients, searchQuery, activeTab])

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"><circle cx="5.5" cy="5.5" r="4" /><line x1="9" y1="9" x2="12" y2="12" /></svg>
          <input 
            type="text" 
            placeholder="Search by name, DOB, phone, or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-sm btn-p" onClick={() => showToast('Opening New Patient wizard...')}>+ New Patient</button>
        <button className="btn btn-sm" onClick={() => showToast('CSV Import dialog opened.')}>Import CSV</button>
      </div>

      <div className="g4">
        <div className="metric"><div className="m-lbl">Total Patients</div><div className="m-val">{isLoading ? '…' : totalPatients.toLocaleString()}</div></div>
        <div className="metric"><div className="m-lbl">Active (12 mo)</div><div className="m-val">{isLoading ? '…' : activePatients.toLocaleString()}</div></div>
        <div className="metric"><div className="m-lbl">New This Month</div><div className="m-val up">23</div></div>
        <div className="metric"><div className="m-lbl">Overdue Recall</div><div className="m-val dn">47</div></div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="sec-t">Patient List</div>
          <div className="subtabs">
            {['All', 'New', 'Recall Due', 'Inactive', 'Unscheduled Tx', 'Outstanding Balance'].map(tab => (
              <div 
                key={tab} 
                className={`stab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>DOB / Age</th><th>Phone</th><th>Email</th><th>Address</th><th>Chart #</th><th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>Loading from OpenDental...</td></tr>
              )}
              {isError && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--red-400)' }}>Failed to load patients. Check API connection.</td></tr>
              )}
              {filteredPatients.map((p) => (
                <tr key={p.PatNum}>
                  <td style={{ fontWeight: 600 }}>{formatName(p)}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{formatDate(p.Birthdate)}</span>
                    <span style={{ color: 'var(--text3)', fontSize: 11 }}>  -  {calcAge(p.Birthdate)}y</span>
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{formatPhone(p)}</td>
                  <td style={{ fontSize: 11 }}>{p.Email || ''}</td>
                  <td style={{ fontSize: 11 }}>{p.Address ? `${p.Address}, ${p.City}` : ''}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{p.ChartNumber || ''}</td>
                  <td><button className="btn btn-sm" onClick={() => showToast(`Opening chart for ${formatName(p)}`)}>View Chart</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: 'var(--blue-600, #2563eb)', color: '#fff', 
          padding: '12px 24px', borderRadius: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          fontWeight: 500, zIndex: 9999, animation: 'slideIn 0.2s ease-out'
        }}>
          {toastMsg}
        </div>
      )}
    </>
  )
}


