'use client'
import { useResource } from '@/hooks/useResource'

type ComplianceData = {
  overallScore: number
  categories: { name: string; score: number; items: { label: string; status: string; detail: string }[] }[]
  auditLog: { ts: string; user: string; action: string; detail: string }[]
}

type CheckItem = { label: string; status: 'Pass' | 'Warn' | 'Fail'; detail: string };

export default function Compliance() {
  const { data, isLoading } = useResource<ComplianceData>('compliance')

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const categories = data?.categories ?? []
  const auditLog = data?.auditLog ?? []
  const overallScore = data?.overallScore ?? 0

  const scoreColor = (s: number) => s >= 90 ? 'var(--green-400)' : s >= 75 ? 'var(--amber-400)' : 'var(--red-400)';
  const itemBadge: Record<CheckItem['status'], string> = { Pass: 'bg', Warn: 'ba', Fail: 'br' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="sec-t">Compliance Dashboard</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>HIPAA  -  OSHA  -  Data Security  Trinity Dental Centers</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm">Download Report</button>
          <button className="btn btn-sm btn-p">Schedule Audit</button>
        </div>
      </div>

      <div className="g4">
        {[
          { label: 'Compliance Score', value: `${overallScore}%`, sub: 'Excellent  2 warnings', up: true },
          { label: 'HIPAA Training', value: '92%', sub: '1 staff member pending' },
          { label: 'BAAs Active', value: '14', sub: 'All vendors covered', up: true },
          { label: 'Last Audit', value: 'Feb 2026', sub: 'Next: Aug 2026' },
        ].map(m => (
          <div className="card metric" key={m.label}>
            <div className="m-lbl">{m.label}</div>
            <div className="m-val">{m.value}</div>
            <div className={`m-sub${m.up ? ' up' : ''}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="alert al-w" style={{ fontSize: 13 }}>
        2 action items require attention: 1 inactive user account and 1 missing SDS entry at North Campus. Resolve before end of month.
      </div>

      <div className="g2" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {categories.map(cat => (
            <div className="card" key={cat.name}>
              <div className="row" style={{ marginBottom: 12 }}>
                <div className="card-h" style={{ margin: 0 }}>{cat.name}</div>
                <span style={{ fontWeight: 700, fontSize: 14, color: scoreColor(cat.score) }}>{cat.score}%</span>
              </div>
              {cat.items.map((item, i) => (
                <div key={i} className="row" style={{ padding: '8px 0', borderBottom: i < cat.items.length - 1 ? '1px solid var(--border)' : 'none', gap: 8, alignItems: 'flex-start' }}>
                  <span className={`badge ${itemBadge[item.status as CheckItem['status']]}`} style={{ fontSize: 10, flexShrink: 0, marginTop: 1 }}>{item.status}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h">Score Breakdown</div>
            {categories.map(cat => (
              <div key={cat.name} style={{ marginBottom: 12 }}>
                <div className="row" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{cat.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(cat.score) }}>{cat.score}%</span>
                </div>
                <div className="pw">
                  <div className={cat.score >= 90 ? 'pf-g' : cat.score >= 75 ? 'pf-a' : 'pf-r'} style={{ width: `${cat.score}%` }} />
                </div>
              </div>
            ))}
            <div className="divider" />
            <div className="row" style={{ marginTop: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Overall</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor(overallScore) }}>{overallScore}%</span>
            </div>
          </div>

          <div className="card">
            <div className="card-h">Recent Audit Log</div>
            {auditLog.map((e, i) => (
              <div key={i} style={{ padding: '9px 0', borderBottom: i < auditLog.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="row" style={{ marginBottom: 2 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{e.ts}</span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{e.user}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{e.action}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.detail}</div>
              </div>
            ))}
            <button className="btn btn-sm" style={{ marginTop: 10, width: '100%', fontSize: 12 }}>View Full Audit Log</button>
          </div>
        </div>
      </div>
    </div>
  );
}
