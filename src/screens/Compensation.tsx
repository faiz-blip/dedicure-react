'use client';
import { useState } from 'react';
import { useResource } from '@/hooks/useResource';

type CompModel = 'collections' | 'production';

interface Provider {
  name: string; role: string; avatarCls: string;
  collections: number; production: number;
  rateCol: number; rateProd: number;
  bonusThreshold: number; ytdComp: number;
}

type CompData = {
  providers: Provider[]
  breakdown: { code: string; proc: string; units: number; fee: number; provider: string }[]
}

export default function Compensation() {
  const [model, setModel] = useState<CompModel>('collections');
  const [selectedProvider, setSelectedProvider] = useState('All');
  const { data, isLoading } = useResource<CompData>('compensation');

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const providers = data?.providers ?? [];
  const breakdown = data?.breakdown ?? [];

  const getComp = (p: Provider) => {
    const base = model === 'collections' ? p.collections * (p.rateCol / 100) : p.production * (p.rateProd / 100);
    const bonusBase = model === 'collections' ? p.collections : p.production;
    const bonus = bonusBase > p.bonusThreshold ? (bonusBase - p.bonusThreshold) * 0.05 : 0;
    return { base: Math.round(base), bonus: Math.round(bonus), total: Math.round(base + bonus) };
  };

  const visBreakdown = selectedProvider === 'All' ? breakdown : breakdown.filter(b => b.provider === selectedProvider);

  return (
    <div>
      <div className="row" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Provider Compensation</div>
          <div style={{ color: 'var(--text2)', marginTop: 2 }}>March 2026 MTD  Trinity Dental Centers</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div className="subtabs">
            <button className={`stab${model === 'collections' ? ' active' : ''}`} onClick={() => setModel('collections')}>% of Collections</button>
            <button className={`stab${model === 'production' ? ' active' : ''}`} onClick={() => setModel('production')}>% of Production</button>
          </div>
          <button className="btn btn-sm">Export Payroll</button>
        </div>
      </div>

      <div className="g4" style={{ marginBottom: 24 }}>
        {[['Total Comp MTD', '$42,480', 'All providers combined', ''], ['Dr. Patel', '$18,240', `${model === 'collections' ? '32' : '28'}% comp rate`, 'up'], ['Dr. Lee', '$16,840', `${model === 'collections' ? '30' : '26'}% comp rate`, 'up'], ['Hygiene Total', '$7,400', 'Maria + Kim combined', '']].map(([lbl, val, sub, dir]) => (
          <div className="card" key={lbl}><div className="metric"><div className="m-lbl">{lbl}</div><div className="m-val">{val}</div><div className={`m-sub ${dir}`}>{sub}</div></div></div>
        ))}
      </div>

      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-h"><span className="sec-t">Compensation Summary</span><span className="badge bb">{model === 'collections' ? '% Collections' : '% Production'}</span></div>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>{model === 'collections' ? 'Collections' : 'Production'}</th>
                  <th>Rate</th><th>Base Comp</th><th>Bonus</th><th>Total MTD</th><th>YTD Comp</th>
                </tr>
              </thead>
              <tbody>
                {providers.map(p => {
                  const { base, bonus, total } = getComp(p);
                  const rate = model === 'collections' ? p.rateCol : p.rateProd;
                  const basis = model === 'collections' ? p.collections : p.production;
                  return (
                    <tr key={p.name}>
                      <td>
                        <div className="row" style={{ gap: 8 }}>
                          <div className={`av ${p.avatarCls}`} style={{ width: 28, height: 28, fontSize: 12 }}>{p.name[0]}</div>
                          <div><div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.role}</div></div>
                        </div>
                      </td>
                      <td>${basis.toLocaleString()}</td>
                      <td><span className="badge bb">{rate}%</span></td>
                      <td>${base.toLocaleString()}</td>
                      <td style={{ color: bonus > 0 ? 'var(--green-600)' : 'var(--text3)', fontWeight: bonus > 0 ? 700 : 400 }}>
                        {bonus > 0 ? `+$${bonus.toLocaleString()}` : ''}
                      </td>
                      <td style={{ fontWeight: 700 }}>${total.toLocaleString()}</td>
                      <td style={{ color: 'var(--text2)' }}>${p.ytdComp.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="alert al-s" style={{ marginTop: 12 }}>Bonus threshold triggered for Dr. Patel: collections exceeded $40K target. Bonus at 5% of overage.</div>
        </div>

        <div className="card">
          <div className="sec-t" style={{ marginBottom: 8 }}>Bonus Threshold Progress</div>
          {providers.map(p => {
            const basis = model === 'collections' ? p.collections : p.production;
            const pct = Math.min((basis / p.bonusThreshold) * 100, 120);
            const exceeded = basis > p.bonusThreshold;
            return (
              <div key={p.name} style={{ marginBottom: 18 }}>
                <div className="row" style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: exceeded ? 'var(--green-600)' : 'var(--text2)' }}>
                    ${basis.toLocaleString()} / ${p.bonusThreshold.toLocaleString()}
                    {exceeded && <span className="badge bg" style={{ marginLeft: 6 }}>Bonus!</span>}
                  </span>
                </div>
                <div className="pw">
                  <div className={`pf ${exceeded ? 'pf-g' : ''}`} style={{ width: `${Math.min(pct, 100)}%`, background: exceeded ? 'var(--green-400)' : 'var(--blue-600)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <span className="sec-t">Procedure Breakdown</span>
          <div className="row" style={{ gap: 8 }}>
            <select className="inp" style={{ fontSize: 12, padding: '4px 8px', height: 30 }} value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}>
              <option value="All">All Providers</option>
              {providers.map(p => <option key={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>CDT Code</th><th>Procedure</th><th>Units</th><th>Fee/Unit</th><th>Total Billed</th><th>Provider</th></tr></thead>
            <tbody>
              {visBreakdown.map((b, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{b.code}</td>
                  <td>{b.proc}</td>
                  <td>{b.units}</td>
                  <td>${b.fee.toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>${(b.units * b.fee).toLocaleString()}</td>
                  <td>{b.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
