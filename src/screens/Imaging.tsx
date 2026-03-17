export default function Imaging() {
  const images = [
    { id: 1, type: 'Bitewing 4-Film', date: 'Mar 10, 2026', provider: 'Dr. Patel', notes: 'Caries #14 confirmed', tag: 'BW' },
    { id: 2, type: 'PA #14', date: 'Feb 22, 2026', provider: 'Dr. Patel', notes: 'Pre-crown PA, apical normal', tag: 'PA' },
    { id: 3, type: 'PA #3', date: 'Feb 22, 2026', provider: 'Dr. Patel', notes: 'Incidental decay noted', tag: 'PA' },
    { id: 4, type: 'Panoramic', date: 'Jan 15, 2025', provider: 'Dr. Lee', notes: 'Bone levels WNL, no pathology', tag: 'PAN' },
    { id: 5, type: 'FMX (18 films)', date: 'Dec 3, 2024', provider: 'Dr. Patel', notes: 'Full series, perio staging', tag: 'FMX' },
    { id: 6, type: 'PA #30', date: 'Nov 18, 2024', provider: 'Dr. Lee', notes: 'Pre-RCT, apical abscess', tag: 'PA' },
    { id: 7, type: 'Bitewing 2-Film', date: 'Jun 4, 2024', provider: 'Hygienist Maria', notes: 'Annual recall series', tag: 'BW' },
    { id: 8, type: 'PA #9', date: 'Mar 20, 2024', provider: 'Dr. Patel', notes: 'Trauma follow-up, enamel fracture', tag: 'PA' },
  ];

  const aiFindings = [
    { tooth: '#2', finding: 'Incipient occlusal caries', confidence: 87, severity: 'low' },
    { tooth: '#14', finding: 'Moderate occlusal caries to dentin', confidence: 96, severity: 'high' },
    { tooth: '#19', finding: 'Distal interproximal caries', confidence: 91, severity: 'medium' },
    { tooth: '#3', finding: 'Marginal bone loss 1.5mm', confidence: 84, severity: 'low' },
    { tooth: '#30', finding: 'Post-treatment periapical normal', confidence: 94, severity: 'none' },
  ];

  const tagColor = (t: string) => t === 'BW' ? 'bb' : t === 'PA' ? 'bx' : t === 'PAN' ? 'bg' : 'bp';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="g4">
        <div className="card"><div className="metric"><div className="m-lbl">Total Images</div><div className="m-val">14</div><div className="m-sub up">Marcus Webb on file</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">AI Analyzed</div><div className="m-val">14</div><div className="m-sub up">100% coverage</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Caries Detected</div><div className="m-val">3</div><div className="m-sub dn">AI-flagged lesions</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Last Pano</div><div className="m-val">Jan 2025</div><div className="m-sub dn">Annual update due</div></div></div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-h">
            <span className="sec-t">Image Gallery  Marcus Webb</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm">Upload Image</button>
              <button className="btn btn-p btn-sm">Run AI Analysis</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {images.map((img) => (
              <div key={img.id} style={{ cursor: 'pointer' }}>
                <div style={{
                  background: '#0a0f1a',
                  border: '2px solid #1e2d40',
                  borderRadius: 8,
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: '70%', height: '60%', borderRadius: 4,
                    background: 'linear-gradient(135deg, #1a2840 0%, #0d1f35 50%, #152233 100%)',
                    opacity: 0.9,
                    boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)',
                  }} />
                  <div style={{ position: 'absolute', top: 6, right: 6 }}>
                    <span className={`badge ${tagColor(img.tag)}`} style={{ fontSize: 9 }}>{img.tag}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, color: '#4a6280', fontFamily: 'var(--mono)' }}>
                    {img.date.split(',')[0]}
                  </div>
                </div>
                <div style={{ fontSize: 11, marginTop: 4, fontWeight: 500, color: 'var(--text2)' }}>{img.type}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{img.provider}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><span className="sec-t">AI Caries Detection</span><span className="badge bb">DEXIS AI v4.1</span></div>
            {aiFindings.map((f, i) => (
              <div key={i} className="fin-r">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge bx" style={{ fontFamily: 'var(--mono)' }}>{f.tooth}</span>
                    <span style={{ fontSize: 13 }}>{f.finding}</span>
                  </div>
                  <span className={`badge ${f.severity === 'high' ? 'br' : f.severity === 'medium' ? 'ba' : f.severity === 'low' ? 'bb' : 'bg'}`}>
                    {f.severity === 'none' ? 'normal' : f.severity}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="pw" style={{ flex: 1 }}><div className="pf pf-g" style={{ width: `${f.confidence}%` }} /></div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{f.confidence}% conf</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-h"><span className="sec-t">Bone Level Measurements</span></div>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text2)' }}>
              <div className="fin-r"><span>Maxillary average CEJbone: </span><strong>1.8mm</strong></div>
              <div className="fin-r"><span>Mandibular average CEJbone: </span><strong>2.1mm</strong></div>
              <div className="fin-r"><span>Worst site  #14 DB: </span><strong style={{ color: 'var(--amber-400)' }}>3.4mm</strong></div>
              <div className="fin-r"><span>Furcation involvement: </span><strong>None detected</strong></div>
            </div>
            <div className="alert al-i" style={{ marginTop: 8, fontSize: 12 }}>
              AI notes early horizontal bone loss pattern consistent with Stage III periodontitis. Recommend periodontal charting correlation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
