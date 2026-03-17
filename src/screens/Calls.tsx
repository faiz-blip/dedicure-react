'use client'
import { useResource } from '@/hooks/useResource'

type CallsData = {
  callLog: { time: string; caller: string; phone: string; dir: string; dur: string; by: string; outcome: string; topic: string }[]
  missedCalls: { time: string; phone: string; attempts: number; status: string }[]
  activeCalls: { name: string; topic: string; dur: string; by: string; status: string }[]
  hourly: { h: string; v: number }[]
  topReasons: { reason: string; count: number }[]
}

const OUTCOME_CLS: Record<string, string> = { Booked: 'bg', Resolved: 'bb', Callback: 'ba', Missed: 'br', Confirmed: 'bg' }
const TOPIC_CLS: Record<string, string> = { 'New Patient': 'bp', Appointment: 'bb', Billing: 'ba', Insurance: 'ba', Recall: 'bg', General: 'bx' }

export default function Calls() {
  const { data, isLoading } = useResource<CallsData>('calls')

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const CALL_LOG = data?.callLog ?? []
  const MISSED = data?.missedCalls ?? []
  const ACTIVE_CALLS = data?.activeCalls ?? []
  const HOURLY = data?.hourly ?? []
  const TOP_REASONS = data?.topReasons ?? []

  const maxV = Math.max(...HOURLY.map((h) => h.v), 1)
  const maxR = Math.max(...TOP_REASONS.map((r) => r.count), 1)

  return (
    <>
      <div className="g4">
        <div className="metric"><div className="m-lbl">Calls Today</div><div className="m-val">24</div><div className="m-sub dn">- 5 missed</div></div>
        <div className="metric"><div className="m-lbl">Answer Rate</div><div className="m-val">79%</div><div className="m-sub dn">- target 90%</div></div>
        <div className="metric"><div className="m-lbl">Avg Handle Time</div><div className="m-val">3:42</div><div className="m-sub up">- under 4:00 target</div></div>
        <div className="metric"><div className="m-lbl">Appointments Booked</div><div className="m-val">8</div><div className="m-sub up">- 42% booking rate</div></div>
      </div>

      <div className="alert al-s" style={{ marginBottom: 4 }}>
        <span>*</span>
        <span><strong>AI currently managing 3 active lines.</strong> 75% of today&apos;s calls fully resolved without staff involvement. AI booked 5 of 8 appointments today.</span>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h">
            <div className="sec-t">Active Calls  Live</div>
            <span className="badge bg" style={{ animation: 'pulse 2s infinite' }}>3 Live</span>
          </div>
          {ACTIVE_CALLS.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < ACTIVE_CALLS.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-400)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{c.topic}</div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{c.dur}</span>
              <span className={`badge ${c.by === 'AI' ? 'bp' : 'bb'}`}>{c.by === 'AI' ? 'AI Handling' : 'Staff'}</span>
              <button className="btn btn-sm">Monitor</button>
            </div>
          ))}
        </div>

        <div className="card fixed" style={{ width: 240 }}>
          <div className="card-h">
            <div className="sec-t">Missed Calls</div>
            <span className="badge br">5 pending</span>
          </div>
          {MISSED.map((m, i) => (
            <div key={i} style={{ padding: '9px 0', borderBottom: i < MISSED.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="row" style={{ marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 12, flex: 1 }}>{m.phone}</span>
                <span className={`badge ${m.status === 'Recovered' ? 'bg' : m.status === 'Left VM' ? 'ba' : 'br'}`} style={{ fontSize: 10 }}>{m.status}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: m.status !== 'Recovered' ? 6 : 0 }}>{m.time}  -  {m.attempts} attempt{m.attempts > 1 ? 's' : ''}</div>
              {m.status !== 'Recovered' && <button className="btn btn-sm" style={{ fontSize: 10 }}>Call Back</button>}
            </div>
          ))}
        </div>
      </div>

      <div className="row">
        <div className="card grow" style={{ flex: 2 }}>
          <div className="card-h">
            <div className="sec-t">Call Log  Today</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div className="subtabs">
                <div className="stab active">All</div>
                <div className="stab">Inbound</div>
                <div className="stab">Outbound</div>
                <div className="stab">AI Handled</div>
              </div>
              <button className="btn btn-sm">Export</button>
            </div>
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr><th>Time</th><th>Caller</th><th>Dir</th><th>Duration</th><th>Topic</th><th>Handled By</th><th>Outcome</th><th>Recording</th></tr>
              </thead>
              <tbody>
                {CALL_LOG.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)' }}>{c.time}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 12 }}>{c.caller}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{c.phone}</div>
                    </td>
                    <td><span className={`badge ${c.dir === 'In' ? 'bb' : 'bx'}`} style={{ fontSize: 10 }}>{c.dir}</span></td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{c.dur}</td>
                    <td><span className={`badge ${TOPIC_CLS[c.topic] ?? 'bx'}`} style={{ fontSize: 10 }}>{c.topic}</span></td>
                    <td><span className={`badge ${c.by === 'AI' ? 'bp' : 'bb'}`} style={{ fontSize: 10 }}>{c.by}</span></td>
                    <td><span className={`badge ${OUTCOME_CLS[c.outcome] ?? 'bx'}`} style={{ fontSize: 10 }}>{c.outcome}</span></td>
                    <td>{c.dur !== '0:00' ? <button className="btn btn-sm" style={{ fontSize: 10 }}>- Play</button> : <span style={{ color: 'var(--text3)', fontSize: 10 }}></span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><div className="sec-t">Volume by Hour</div></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '4px 0' }}>
              {HOURLY.map((h) => (
                <div key={h.h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  {h.v > 0 && <span style={{ fontSize: 9, color: 'var(--text2)' }}>{h.v}</span>}
                  <div style={{ width: '100%', height: `${(h.v / maxV) * 55}px`, minHeight: h.v > 0 ? 4 : 0, background: h.v === 0 ? 'var(--border)' : 'var(--blue-600)', borderRadius: 3, opacity: 0.85 }} />
                  <span style={{ fontSize: 9, color: 'var(--text3)' }}>{h.h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h"><div className="sec-t">Top Call Reasons</div></div>
            {TOP_REASONS.map((r, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div className="row" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1 }}>{r.reason}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{r.count}</span>
                </div>
                <div className="pw" style={{ height: 5 }}>
                  <div className="pf pf-g" style={{ width: `${(r.count / maxR) * 100}%`, height: '100%' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-h"><div className="sec-t">AI Resolution Rate</div></div>
            <div style={{ marginBottom: 10 }}>
              <div className="row" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1 }}>Fully resolved by AI</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-400)' }}>75%</span>
              </div>
              <div className="pw" style={{ height: 7 }}><div className="pf pf-g" style={{ width: '75%', height: '100%' }} /></div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div className="row" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1 }}>Transferred to staff</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>21%</span>
              </div>
              <div className="pw" style={{ height: 7 }}><div className="pf pf-a" style={{ width: '21%', height: '100%' }} /></div>
            </div>
            <div>
              <div className="row" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1 }}>Abandoned / missed</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red-400)' }}>4%</span>
              </div>
              <div className="pw" style={{ height: 7 }}><div className="pf pf-r" style={{ width: '4%', height: '100%' }} /></div>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><div className="sec-t">Scripts &amp; Call Flows</div></div>
            {['New Patient Greeting', 'Appointment Reminder', 'Insurance Verification', 'Billing Inquiry', 'Recall Callback'].map((s, i) => (
              <div key={i} className="fin-r">
                <span style={{ fontSize: 12 }}>{s}</span>
                <button className="btn btn-sm" style={{ fontSize: 10 }}>View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
