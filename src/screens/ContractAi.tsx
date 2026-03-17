'use client'
import { useState } from 'react'
import { useAI } from '@/hooks/useAI'

const CONTRACTS = [
  { payer: 'Cigna DPPO', patients: 284, prod: 38420, writeoff: 9605, writeoffPct: 25, fee: 'Below', leverage: 'High', opp: '$28,400' },
  { payer: 'MetLife PDP', patients: 198, prod: 29840, writeoff: 6565, writeoffPct: 22, fee: 'At Market', leverage: 'Medium', opp: '$8,200' },
  { payer: 'Delta Dental PPO', patients: 512, prod: 72480, writeoff: 12922, writeoffPct: 18, fee: 'At Market', leverage: 'Low', opp: '$4,100' },
  { payer: 'Aetna DMO', patients: 88, prod: 10240, writeoff: 3072, writeoffPct: 30, fee: 'Far Below', leverage: 'High', opp: '$18,400' },
  { payer: 'United Concordia', patients: 42, prod: 5620, writeoff: 1124, writeoffPct: 20, fee: 'Below', leverage: 'Medium', opp: '$3,200' },
  { payer: 'Humana Dental', patients: 31, prod: 3840, writeoff: 845, writeoffPct: 22, fee: 'At Market', leverage: 'Low', opp: '$1,100' },
  { payer: 'Self-Pay / FFS', patients: 156, prod: 24840, writeoff: 0, writeoffPct: 0, fee: 'Full Fee', leverage: '', opp: '' },
]

const FEE_CLS: Record<string, string> = { 'Below': 'ba', 'Far Below': 'br', 'At Market': 'bt', 'Full Fee': 'bg' }
const LEV_CLS: Record<string, string> = { 'High': 'br', 'Medium': 'ba', 'Low': 'bg', '': 'bx' }


export default function ContractAi() {
  const [selectedPayer, setSelectedPayer] = useState('Cigna DPPO')
  const [strategy, setStrategy] = useState('Fee increase (1015%)')
  const [brief, setBrief] = useState('')

  const { generateContent, isLoading: aiLoading } = useAI({
    systemInstruction: 'You are a dental insurance contract negotiation consultant. Write concise, data-driven negotiation briefs for dental practices. Include leverage analysis, recommended strategy, key talking points, and fallback options. Use the provided payer data. Format with clear sections.',
  })

  const generateBrief = async () => {
    const payer = CONTRACTS.find(c => c.payer === selectedPayer)
    if (!payer) return
    const prompt = `Write a negotiation brief for ${payer.payer}. Practice data: ${payer.patients} patients, $${payer.prod.toLocaleString()} MTD production, $${payer.writeoff.toLocaleString()} write-offs (${payer.writeoffPct}% write-off rate), fee schedule is ${payer.fee} vs market, leverage: ${payer.leverage}, annual opportunity: ${payer.opp}. Strategy requested: ${strategy}. Practice strengths: 4.9... Google rating, clean billing, sub-30 A/R days.`
    const result = await generateContent(prompt)
    if (result) setBrief(result)
  }

  return (
    <>
      <div className="ai-card" style={{ marginBottom: 16 }}>
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div>
            <div className="ai-title">AI Contract Negotiation  Know Your Leverage Before You Call</div>
            <div className="ai-sub">Analyzes your write-off rates, patient volume, and market data to build a data-driven negotiation brief for every payer</div>
          </div>
          <span className="badge bp" style={{ marginLeft: 'auto' }}>$84,200 annual increase identified</span>
        </div>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="metric"><div className="m-lbl">Payers Analyzed</div><div className="m-val">7</div></div>
        <div className="metric"><div className="m-lbl">Contracts to Renegotiate</div><div className="m-val warn">3</div><div className="m-sub">Significant leverage</div></div>
        <div className="metric"><div className="m-lbl">Total Annual Opportunity</div><div className="m-val up">$84,200</div><div className="m-sub">If all 3 renegotiated</div></div>
        <div className="metric"><div className="m-lbl">Last Contract Review</div><div className="m-val warn">3 yrs ago</div><div className="m-sub">Industry: annual</div></div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h"><div className="sec-t">Payer Contract Analysis & Strategy</div></div>
          <div className="tw">
            <table>
              <thead><tr><th>Payer</th><th>Patients</th><th>MTD Production</th><th>Write-off $</th><th>Write-off %</th><th>Fee vs Market</th><th>Leverage</th><th>Annual Opp.</th><th></th></tr></thead>
              <tbody>
                {CONTRACTS.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.payer}</td>
                    <td>{c.patients}</td>
                    <td>${c.prod.toLocaleString()}</td>
                    <td style={{ color: c.writeoff > 0 ? 'var(--red-400)' : 'var(--text3)', fontWeight: c.writeoff > 0 ? 600 : 400 }}>{c.writeoff > 0 ? `-$${c.writeoff.toLocaleString()}` : ''}</td>
                    <td><span className={`badge ${c.writeoffPct > 25 ? 'br' : c.writeoffPct > 18 ? 'ba' : 'bg'}`}>{c.writeoffPct}%</span></td>
                    <td><span className={`badge ${FEE_CLS[c.fee]}`}>{c.fee}</span></td>
                    <td><span className={`badge ${LEV_CLS[c.leverage]}`}>{c.leverage}</span></td>
                    <td style={{ fontWeight: 600, color: c.opp !== '' ? 'var(--green-400)' : 'var(--text3)' }}>{c.opp}</td>
                    <td><button className="btn btn-sm" disabled={aiLoading} onClick={() => setSelectedPayer(c.payer)}>Select</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card fixed" style={{ width: 280 }}>
          <div className="card-h"><div className="sec-t">Generate Negotiation Brief</div></div>
          <div className="fgrp"><label className="flbl">Select Payer</label>
            <select className="inp" value={selectedPayer} onChange={e => setSelectedPayer(e.target.value)}>
              {CONTRACTS.filter(c => c.writeoffPct > 0).map(c => <option key={c.payer}>{c.payer}</option>)}
            </select>
          </div>
          <div className="fgrp"><label className="flbl">Strategy</label>
            <select className="inp" value={strategy} onChange={e => setStrategy(e.target.value)}>
              <option>Fee increase (1015%)</option><option>Drop plan entirely</option><option>Renegotiate specific codes</option><option>Move to fee-for-service</option>
            </select>
          </div>
          <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }} onClick={generateBrief} disabled={aiLoading}>
            {aiLoading ? '* Generating' : '* Generate Brief'}
          </button>
          <div style={{ fontSize: 11, lineHeight: 1.8, color: 'var(--text2)', minHeight: 180, background: 'var(--gray-50)', borderRadius: 8, padding: 10, border: '1px solid var(--border)', whiteSpace: 'pre-wrap', fontFamily: brief ? 'var(--font)' : undefined }}>
            {brief || 'Select a payer and click Generate Brief to get a data-driven negotiation strategy...'}
          </div>
          <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={!brief}>Export as PDF Letter</button>
        </div>
      </div>
    </>
  )
}

