'use client'
import { useResource } from '@/hooks/useResource'

type Integration = {
  name: string
  category: string
  status: string
  detail: string
  lastSync?: string
  badge?: string
}

type IntData = {
  integrations: Integration[]
  webhookLog: { time: string; src: string; event: string; code: number }[]
  apiKeys: { name: string; created: string; scope: string }[]
}

export default function Integrations() {
  const { data, isLoading } = useResource<IntData>('integrations')

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const INTEGRATIONS = data?.integrations ?? []
  const WEBHOOK_LOG = data?.webhookLog ?? []
  const apiKeys = data?.apiKeys ?? []

  return (
    <>
      <div className="g4">
        <div className="metric"><div className="m-lbl">Connected</div><div className="m-val">8</div><div className="m-sub up">- All core systems</div></div>
        <div className="metric"><div className="m-lbl">Sync Errors</div><div className="m-val warn">1</div><div className="m-sub dn">Solutionreach</div></div>
        <div className="metric"><div className="m-lbl">Last Full Sync</div><div className="m-val">2 min</div><div className="m-sub">ago  -  Dentrix</div></div>
        <div className="metric"><div className="m-lbl">Data Points Today</div><div className="m-val">14,284</div><div className="m-sub up">- Across all systems</div></div>
      </div>

      <div className="alert al-d">
        <span> - </span>
        <span><strong>Solutionreach token expired.</strong> Patient messaging and appointment reminders from Solutionreach are paused. Reauthenticate now to restore service. <button className="btn btn-sm" style={{ marginLeft: 8 }}>Reauthenticate -&gt;</button></span>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="sec-t">All Integrations</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="subtabs">
              <div className="stab active">All</div>
              <div className="stab">Connected</div>
              <div className="stab">Errors</div>
              <div className="stab">Available</div>
            </div>
            <button className="btn btn-sm btn-p">+ Add Integration</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {INTEGRATIONS.map((intg) => (
            <div key={intg.name} style={{ border: `1px solid ${intg.status === 'error' ? 'var(--red-400)' : 'var(--border)'}`, borderRadius: 10, padding: 14, background: intg.status === 'error' ? 'rgba(239,68,68,.04)' : 'var(--surface)', opacity: intg.status === 'disconnected' ? 0.65 : 1 }}>
              <div className="row" style={{ marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{intg.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{intg.category}</div>
                </div>
                <span className={`badge ${intg.badge ?? 'bx'}`} style={{ marginLeft: 'auto', fontSize: 10 }}>
                  {intg.status === 'connected' ? 'Connected' : intg.status === 'error' ? 'Error' : intg.name === 'Eaglesoft' ? 'Soon' : 'Setup'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 8 }}>{intg.detail}</div>
              {intg.lastSync && <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>Last sync: {intg.lastSync}</div>}
              <div style={{ display: 'flex', gap: 6 }}>
                {intg.status === 'connected' && <button className="btn btn-sm" style={{ fontSize: 10 }}>Settings</button>}
                {intg.status === 'connected' && <button className="btn btn-sm" style={{ fontSize: 10 }}>Sync Now</button>}
                {intg.status === 'error' && <button className="btn btn-sm btn-p" style={{ fontSize: 10 }}>Fix Error</button>}
                {intg.status === 'disconnected' && intg.name !== 'Eaglesoft' && <button className="btn btn-sm btn-p" style={{ fontSize: 10 }}>Connect</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h">
            <div className="sec-t">Solutionreach  Error Details</div>
            <span className="badge br">Action Required</span>
          </div>
          <div className="alert al-d" style={{ marginBottom: 12 }}>
            <span> - </span>
            <span><strong>Error:</strong> OAuth 2.0 token expired on Mar 14, 2026 at 11:58 PM. All outbound messaging (appointment reminders, recall texts, birthday messages) is currently paused. Estimated missed messages: 18 since midnight.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="fin-r">
              <span style={{ fontSize: 12 }}>Integration status</span>
              <span className="badge br">Token Expired</span>
            </div>
            <div className="fin-r">
              <span style={{ fontSize: 12 }}>Last successful sync</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>Mar 14, 11:47 PM</span>
            </div>
            <div className="fin-r">
              <span style={{ fontSize: 12 }}>Messages queued</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red-400)' }}>18 pending</span>
            </div>
            <div className="fin-r">
              <span style={{ fontSize: 12 }}>Affected workflows</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>Recall, Appt Reminders, Birthday</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-sm btn-p">Reauthenticate Now</button>
            <button className="btn btn-sm">View Error Log</button>
          </div>
        </div>

        <div className="card fixed" style={{ width: 280 }}>
          <div className="card-h"><div className="sec-t">API Key Management</div><button className="btn btn-sm btn-p">+ New Key</button></div>
          {apiKeys.map((k, i) => (
            <div key={i} className="fin-r">
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{k.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>Created {k.created}  -  {k.scope}</div>
              </div>
              <span className="badge bg" style={{ fontSize: 9 }}>Active</span>
            </div>
          ))}
          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 8 }}><div className="sec-t">Webhook Log</div></div>
          {WEBHOOK_LOG.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: i < WEBHOOK_LOG.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', width: 54, flexShrink: 0 }}>{w.time}</span>
              <span className={`badge ${w.src === 'Solutionreach' ? 'br' : 'bx'}`} style={{ fontSize: 9 }}>{w.src}</span>
              <span style={{ fontSize: 11, color: 'var(--text2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.event}</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: w.code === 200 ? 'var(--green-400)' : 'var(--red-400)', fontWeight: 600 }}>{w.code}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
