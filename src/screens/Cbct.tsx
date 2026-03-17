'use client'

export default function Cbct() {
  return (
    <>
      <div className="ai-card" style={{ marginBottom: 16 }}>
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div>
            <div className="ai-title">CBCT / 3D Imaging  AI-Powered Diagnostic Analysis</div>
            <div className="ai-sub">DICOM v3.0  -  AI Detection Model v4.1  -  Cloud-synced  -  Auto bone density  -  Implant planning overlay</div>
          </div>
          <span className="badge bg" style={{ marginLeft: 'auto' }}>12 Studies on File</span>
        </div>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="metric"><div className="m-lbl">CBCT Studies (30 days)</div><div className="m-val">12</div></div>
        <div className="metric"><div className="m-lbl">AI Pathology Detections</div><div className="m-val warn">4</div><div className="m-sub">Pending review</div></div>
        <div className="metric"><div className="m-lbl">Implant Plans Generated</div><div className="m-val up">3</div><div className="m-sub">By AI overlay</div></div>
        <div className="metric"><div className="m-lbl">Avg Diagnostic Film Fee</div><div className="m-val">$420</div></div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h"><div className="sec-t">3D CBCT Viewer  Marcus Webb  -  Scan Feb 12, 2026</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="badge bg">AI Analysis Complete</span>
              <button className="btn btn-sm">Download DICOM</button>
              <button className="btn btn-sm btn-p">Implant Planning Mode</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            {['Axial (Top-Down)', 'Coronal (Front)', 'Sagittal (Side)'].map(view => (
              <div key={view} style={{ background: '#0a0c10', borderRadius: 10, aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.08)', position: 'relative' }}>
                <svg viewBox="-50 -50 100 100" width="80%" opacity=".6">
                  {view === 'Axial (Top-Down)' && <>
                    <ellipse cx="0" cy="0" rx="40" ry="35" fill="none" stroke="#3B8FE8" strokeWidth="1.5" />
                    {Array.from({ length: 16 }).map((_, i) => {
                      const a = (i / 16) * Math.PI * 2
                      const x = Math.cos(a) * 38, y = Math.sin(a) * 33
                      return <ellipse key={i} cx={x} cy={y} rx="5" ry="4.5" fill="#1A9E72" stroke="#0D6E4E" strokeWidth=".5" />
                    })}
                    <ellipse cx="18" cy="-8" rx="5" ry="4.5" fill="#F0A020" stroke="#9A6010" strokeWidth="1" />
                    <text x="22" y="-14" fontSize="6" fill="#F0A020">#14</text>
                  </>}
                  {view === 'Coronal (Front)' && <>
                    <rect x="-35" y="-15" width="70" height="30" rx="8" fill="none" stroke="#3B8FE8" strokeWidth="1.5" />
                    {[-30,-22,-14,-6,2,10,18,26].map((x, i) => <rect key={i} x={x} y="-12" width="5" height="24" rx="1" fill={x === -6 ? '#F0A020' : '#1A9E72'} opacity=".8" />)}
                  </>}
                  {view === 'Sagittal (Side)' && <>
                    <path d="M-30,20 C-30,-30 30,-30 30,20 Z" fill="none" stroke="#3B8FE8" strokeWidth="1.5" />
                    <path d="M-20,15 C-10,-10 10,-10 20,15" fill="none" stroke="#1A9E72" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="8" cy="-8" r="6" fill="#F0A020" opacity=".8" />
                  </>}
                </svg>
                <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 10, color: 'rgba(255,255,255,.7)', fontFamily: 'var(--mono)' }}>{view}</div>
                {view === 'Axial (Top-Down)' && <div style={{ position: 'absolute', top: 8, right: 10 }}><span className="badge ba" style={{ fontSize: 8 }}>AI: Caries #14</span></div>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="alert al-d" style={{ flex: 1, marginBottom: 0 }}><span></span><span><strong>Caries #14 (Mesial)</strong>  AI confidence 94%. 2mm depth into dentin. Bone level: normal.</span></div>
            <div className="alert al-i" style={{ flex: 1, marginBottom: 0 }}><span></span><span><strong>Bone density at #19 site:</strong> 422 HU  adequate for implant placement. AI recommendation: Nobel Active 4.3  -  10mm.</span></div>
          </div>
        </div>

        <div className="card fixed" style={{ width: 240 }}>
          <div className="card-h"><div className="sec-t">Recent CBCT Studies</div></div>
          {[
            { name: 'Marcus Webb', date: 'Feb 12', finding: 'Caries #14 + Implant plan #19', cls: 'ba' },
            { name: 'Robert Ellis', date: 'Feb 8', finding: 'Impacted #32  complex extraction', cls: 'br' },
            { name: 'Betty Kim', date: 'Feb 3', finding: 'Bone loss  perio Stage III', cls: 'br' },
            { name: 'Linda Torres', date: 'Jan 28', finding: 'Normal  no significant pathology', cls: 'bg' },
            { name: 'Tom Walsh', date: 'Jan 20', finding: 'TMJ disc displacement  bilateral', cls: 'ba' },
          ].map((s, i) => (
            <div key={i} className="fin-r" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{s.date}</span>
              </div>
              <span className={`badge ${s.cls}`} style={{ marginTop: 4, fontSize: 10 }}>{s.finding}</span>
            </div>
          ))}
          <div className="divider" />
          <div className="card-t" style={{ marginBottom: 8 }}>AI Settings</div>
          {['Auto-detect caries', 'Bone density analysis', 'Pathology flagging', 'Implant planning overlay', 'Report auto-generation'].map(f => (
            <div key={f} className="fin-r"><span style={{ fontSize: 11 }}>{f}</span><label className="toggle"><input type="checkbox" defaultChecked /><span className="tslider" /></label></div>
          ))}
        </div>
      </div>
    </>
  )
}

