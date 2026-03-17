'use client'
import { useResource } from '@/hooks/useResource'

type MktData = {
  reviews: { name: string; stars: number; src: string; date: string; responded: boolean; text: string }[]
  campaigns: { name: string; budget: string; spend: string; clicks: number; appts: number; cpa: string; status: string }[]
  platforms: { name: string; stars: number; count: number; badge: string; trend: string }[]
  templates: { name: string; preview: string }[]
}

export default function Marketing() {
  const { data, isLoading } = useResource<MktData>('marketing')
  const srcBadge: Record<string, string> = { Google: 'bg', Yelp: 'ba', Healthgrades: 'bb', Facebook: 'bb' }

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const REVIEWS = data?.reviews ?? []
  const CAMPAIGNS = data?.campaigns ?? []
  const PLATFORMS = data?.platforms ?? []
  const TEMPLATES = data?.templates ?? []

  return (
    <>
      <div className="g4">
        <div className="metric"><div className="m-lbl">Avg Google Rating</div><div className="m-val">4.8...</div><div className="m-sub up">- +0.1 vs last quarter</div></div>
        <div className="metric"><div className="m-lbl">New Reviews This Month</div><div className="m-val">23</div><div className="m-sub up">- +9 vs last month</div></div>
        <div className="metric"><div className="m-lbl">New Patients from Online</div><div className="m-val">14</div><div className="m-sub up">- Google & referrals</div></div>
        <div className="metric"><div className="m-lbl">Review Response Rate</div><div className="m-val">89%</div><div className="m-sub warn">- target 100%</div></div>
      </div>

      <div className="row">
        <div className="card grow" style={{ flex: 2 }}>
          <div className="card-h">
            <div className="sec-t">Recent Reviews</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div className="subtabs">
                <div className="stab active">All</div>
                <div className="stab">5...</div>
                <div className="stab">4...</div>
                <div className="stab">3... &amp; Below</div>
                <div className="stab">Unresponded</div>
              </div>
            </div>
          </div>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < REVIEWS.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="row" style={{ marginBottom: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                <div style={{ color: 'var(--amber-400)', fontSize: 13, letterSpacing: 1 }}>{'...'.repeat(r.stars)}{''.repeat(5 - r.stars)}</div>
                <span className={`badge ${srcBadge[r.src] ?? 'bx'}`} style={{ fontSize: 10 }}>{r.src}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{r.date}</span>
                <span className={`badge ${r.responded ? 'bg' : 'br'}`} style={{ fontSize: 10, marginLeft: 'auto' }}>{r.responded ? 'Responded' : 'Needs Reply'}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8 }}>{r.text}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm">{r.responded ? 'Edit Reply' : 'Respond'}</button>
                <button className="btn btn-sm">Flag</button>
                {!r.responded && <button className="btn btn-sm btn-p">Use Template</button>}
              </div>
            </div>
          ))}
        </div>

        <div className="card fixed" style={{ width: 240 }}>
          <div className="card-h"><div className="sec-t">Reputation Score</div></div>
          {PLATFORMS.map((p) => (
            <div key={p.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="row" style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                <span className={`badge ${p.badge}`} style={{ fontSize: 10 }}>Active</span>
              </div>
              <div className="row">
                <span style={{ color: 'var(--amber-400)', fontWeight: 700, fontSize: 15 }}>{p.stars}...</span>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>{p.count} reviews</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{p.trend}</div>
            </div>
          ))}
          <div className="divider" />
          <div className="sec-t" style={{ marginBottom: 10 }}>Request a Review</div>
          <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 8, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>-</div>
              QR Code Placeholder
            </div>
          </div>
          <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', marginBottom: 6 }}>Send Review Request (SMS)</button>
          <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Send Review Request (Email)</button>
        </div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h">
            <div className="sec-t">Campaign Performance  March 2026</div>
            <button className="btn btn-sm btn-p">+ New Campaign</button>
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr><th>Campaign</th><th>Budget</th><th>Spend</th><th>Clicks / Reach</th><th>Appts Booked</th><th>CPA</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {CAMPAIGNS.map((c) => (
                  <tr key={c.name}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{c.budget}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{c.spend}</td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{c.clicks}</td>
                    <td style={{ fontWeight: 700, color: 'var(--green-400)' }}>{c.appts}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{c.cpa}</td>
                    <td><span className={`badge ${c.status === 'Active' ? 'bg' : 'bx'}`}>{c.status}</span></td>
                    <td><button className="btn btn-sm">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card fixed" style={{ width: 260 }}>
          <div className="card-h"><div className="sec-t">Response Templates</div><button className="btn btn-sm">+ Add</button></div>
          {TEMPLATES.map((t, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < TEMPLATES.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 6 }}>{t.preview.substring(0, 80)}</div>
              <button className="btn btn-sm" style={{ fontSize: 10 }}>Use Template</button>
            </div>
          ))}
          <div className="divider" />
          <div className="sec-t" style={{ marginBottom: 8 }}>Best Practices</div>
          <div className="alert al-i" style={{ fontSize: 11 }}>Respond to all reviews within 24 hrs. Use patient name, thank them, keep it brief and genuine.</div>
          <div className="alert al-s" style={{ fontSize: 11 }}>Avoid clinical details in public responses  reply privately for sensitive issues.</div>
          <div className="alert al-w" style={{ fontSize: 11 }}>Never incentivize reviews  violates Google & Yelp policies. Request naturally after great visits.</div>
        </div>
      </div>
    </>
  )
}
