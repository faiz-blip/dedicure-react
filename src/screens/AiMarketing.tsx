'use client'
import { useState } from 'react'
import { useAI } from '@/hooks/useAI'

const CAMPAIGNS: Record<string, string> = {
  recall: `Hi [Patient Name]! \n\nIt's been a while since your last cleaning at Trinity Dental. Your smile matters to us  and we have openings this week.\n\n... Book instantly: mytrinitydental.com/book\n Or call us: (713) 555-0100\n\nReply STOP to opt out. Trinity Dental Centers.`,
  newpt: `Hello neighbor! Trinity Dental Centers is welcoming new patients in [City].\n\n New Patient Special: Comprehensive exam + X-rays + cleaning for $99 (regularly $380)\n\nWe accept most insurance plans.\n... Book online: mytrinitydental.com/new-patient\n Call: (713) 555-0100\n\nLimited spots available this month!`,
  implant: `Are you living with a missing tooth? Dental implants look, feel, and function like natural teeth  and Trinity Dental is a leader in implant dentistry.\n\n... Single implant from $2,199\n... Free implant consultation (value: $250)\n... Financing from $66/month\n\nBook your free consult today: mytrinitydental.com/implants`,
  invisalign: `Straight teeth, clear aligners  and no one even knows you're wearing them. Trinity Dental is a Platinum Invisalign provider.\n\n Free Invisalign scan + smile simulation\n Financing as low as $99/month\n See real patient transformations online\n\nBook: mytrinitydental.com/invisalign`,
  whitening: `Your summer glow-up starts with your smile \n\nFor a limited time: Professional take-home whitening kit for $149 (reg $349)  exclusively for our patients.\n\nOrder online or pick up at your next visit:\nmytrinitydental.com/whitening\n\nOffer expires March 31, 2026.`,
  reactivate: `Hi [Patient Name], we miss you at Trinity Dental!\n\nWe noticed it's been over a year since your last visit. We'd love to welcome you back  no judgment, just great care.\n\n Welcome-back offer: $0 copay on your first visit back (most insurances)\n... Book now: mytrinitydental.com/return\n\nYour smile is worth it `,
  referral: `Love Trinity Dental? Share the love!  - \n\nRefer a friend or family member and you'll BOTH get a $50 credit toward treatment.\n\n Just have them mention your name when they call or book online.\n\nShare this link: mytrinitydental.com/refer-a-friend`,
}

const GOAL_LABELS: Record<string, string> = {
  recall: 'Recall  bring back overdue patients',
  newpt: 'New patient acquisition',
  implant: 'Implant / high-value case promotion',
  invisalign: 'Invisalign / ortho promo',
  whitening: 'Whitening / cosmetic offer',
  reactivate: 'Reactivate inactive patients (12+ mo)',
  referral: 'Patient referral program',
}

export default function AiMarketing() {
  const [goal, setGoal] = useState('recall')
  const [channel, setChannel] = useState('SMS')
  const [tone, setTone] = useState('Warm & Personal')
  const [segment, setSegment] = useState('All overdue patients')
  const [copy, setCopy] = useState<string>('')

  const { generateContent, isLoading: aiLoading } = useAI({
    systemInstruction: 'You are a dental marketing copywriter. Write compelling, HIPAA-compliant patient outreach copy for dental practices. Keep SMS under 160 chars when possible, emails under 250 words. Use friendly, professional tone. Include a clear call to action.',
  })

  const generate = async () => {
    const prompt = `Write ${channel} campaign copy for a dental practice with this goal: ${GOAL_LABELS[goal] || goal}. Tone: ${tone}. Target segment: ${segment}. Practice name: Trinity Dental Centers. Include a booking link placeholder [BOOKING_LINK] and personalization placeholder [PATIENT_NAME] where appropriate.`
    const result = await generateContent(prompt)
    if (result) setCopy(result)
  }

  return (
    <>
      <div className="ai-card">
        <div className="ai-head">
          <div className="ai-icon">*</div>
          <div>
            <div className="ai-title">AI Marketing Engine  Generate, Segment, Send, Optimize</div>
            <div className="ai-sub">Writes campaigns, segments your patient list, A/B tests subject lines, and learns what converts</div>
          </div>
          <span className="badge bg" style={{ marginLeft: 'auto' }}>4 active campaigns</span>
        </div>
      </div>

      <div className="g4">
        <div className="metric"><div className="m-lbl">AI-Generated Campaigns</div><div className="m-val">12</div><div className="m-sub">This quarter</div></div>
        <div className="metric"><div className="m-lbl">Avg Open Rate (AI)</div><div className="m-val up">38%</div><div className="m-sub">vs 21% industry avg</div></div>
        <div className="metric"><div className="m-lbl">Patients Reactivated</div><div className="m-val up">34</div><div className="m-sub">From AI campaigns MTD</div></div>
        <div className="metric"><div className="m-lbl">Campaign Revenue MTD</div><div className="m-val up">$12,480</div><div className="m-sub">Attributed to AI outreach</div></div>
      </div>

      <div className="row">
        <div className="card grow">
          <div className="card-h"><div className="sec-t">AI Campaign Generator</div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="fgrp">
                <label className="flbl">Campaign Goal</label>
                <select className="inp" value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="recall">Recall  bring back overdue patients</option>
                  <option value="newpt">New patient acquisition</option>
                  <option value="implant">Implant / high-value case promotion</option>
                  <option value="invisalign">Invisalign / ortho promo</option>
                  <option value="whitening">Whitening / cosmetic offer</option>
                  <option value="reactivate">Reactivate inactive patients (12+ mo)</option>
                  <option value="referral">Patient referral program</option>
                </select>
              </div>
              <div className="fgrp">
                <label className="flbl">Channel</label>
                <select className="inp" value={channel} onChange={e => setChannel(e.target.value)}>
                  <option>SMS</option><option>Email</option><option>Both SMS + Email</option><option>Google Ad Copy</option><option>Facebook Ad Copy</option>
                </select>
              </div>
              <div className="fgrp">
                <label className="flbl">Tone</label>
                <select className="inp" value={tone} onChange={e => setTone(e.target.value)}>
                  <option>Warm &amp; Personal</option><option>Professional &amp; Clinical</option><option>Urgent / Limited Time</option><option>Educational</option>
                </select>
              </div>
              <div className="fgrp">
                <label className="flbl">Target Segment</label>
                <select className="inp" value={segment} onChange={e => setSegment(e.target.value)}>
                  <option>All overdue patients (47)</option>
                  <option>VIP patients (LTV &gt;$3k)</option>
                  <option>Unscheduled treatment ($2k+)</option>
                  <option>Inactive 1224 months (312)</option>
                  <option>New patients (last 90 days)</option>
                </select>
              </div>
              <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center' }} onClick={generate} disabled={aiLoading}>
                {aiLoading ? '* Generating' : '* Generate with AI'}
              </button>
            </div>
            <div>
              <div className="card-t" style={{ marginBottom: 8 }}>AI-Generated Campaign Copy</div>
              <div style={{ background: 'var(--green-50)', borderRadius: 10, padding: 14, fontSize: 12, lineHeight: 1.8, minHeight: 220, border: '1px solid rgba(26,158,114,.2)', whiteSpace: 'pre-wrap' }}>
                {copy || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Select a goal and click Generate to create personalized campaign copy...</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn-sm btn-p" style={{ flex: 1, justifyContent: 'center' }} disabled={!copy}>Use This Copy</button>
                <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={generate} disabled={aiLoading}>Regenerate </button>
                <button className="btn btn-sm" disabled={!copy}>A/B Test</button>
              </div>
            </div>
          </div>

          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 12 }}><div className="sec-t">Active Campaigns</div><button className="btn btn-sm btn-p">+ New Campaign</button></div>
          <div className="tw">
            <table>
              <thead><tr><th>Campaign</th><th>Type</th><th>Audience</th><th>Sent</th><th>Responses</th><th>Booked</th><th>Status</th><th></th></tr></thead>
              <tbody>
                <tr><td style={{ fontWeight: 600 }}>March Recall Blast</td><td>SMS</td><td>Overdue recall</td><td>124</td><td style={{ color: 'var(--green-400)', fontWeight: 600 }}>38 (31%)</td><td>22</td><td><span className="badge bg">Active</span></td><td><button className="btn btn-sm">View</button></td></tr>
                <tr><td style={{ fontWeight: 600 }}>New Patient Google Ad</td><td>Google Ads</td><td>10mi radius</td><td></td><td>14 clicks</td><td>6</td><td><span className="badge bg">Active</span></td><td><button className="btn btn-sm">View</button></td></tr>
                <tr><td style={{ fontWeight: 600 }}>Birthday Greetings</td><td>SMS/Email</td><td>Automated</td><td>Always-on</td><td></td><td>3 this month</td><td><span className="badge bg">Active</span></td><td><button className="btn btn-sm">View</button></td></tr>
                <tr><td style={{ fontWeight: 600 }}>Whitening Promo</td><td>Email</td><td>Active patients</td><td>842</td><td>67 (8%)</td><td>11</td><td><span className="badge ba">Paused</span></td><td><button className="btn btn-sm">Resume</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card fixed" style={{ width: 250 }}>
          <div className="card-h"><div className="sec-t">AI Segment Intelligence</div></div>
          {[
            { name: 'Overdue Recall', count: 47, value: '$16,450', badge: 'br' },
            { name: 'Unscheduled Tx', count: 84, value: '$48,200', badge: 'ba' },
            { name: 'Inactive 12+ mo', count: 312, value: '$124,000', badge: 'bx' },
            { name: 'VIP Patients', count: 186, value: 'LTV $3k+', badge: 'bp' },
            { name: 'New (< 90 days)', count: 23, value: 'Nurture', badge: 'bb' },
          ].map((s) => (
            <div key={s.name} className="fin-r">
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{s.count} patients  -  {s.value}</div>
              </div>
              <span className={`badge ${s.badge}`}>{s.count}</span>
            </div>
          ))}
          <div className="divider" />
          <div className="card-t" style={{ marginBottom: 8 }}>Best Send Times (AI)</div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>SMS  highest open</span><span style={{ fontWeight: 600 }}>Tue 10 AM</span></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Email  highest open</span><span style={{ fontWeight: 600 }}>Wed 11 AM</span></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Recall call  pickup</span><span style={{ fontWeight: 600 }}>MonTue AM</span></div>
          <div className="fin-r"><span style={{ fontSize: 11 }}>Avoid sending</span><span style={{ fontWeight: 600 }}>Fri PM / Weekend</span></div>
          <div className="divider" />
          <div className="card-t" style={{ marginBottom: 8 }}>Online Reputation</div>
          <div className="fin-r"><span>Google</span><span style={{ fontWeight: 600 }}>4.9... (184)</span></div>
          <div className="fin-r"><span>Yelp</span><span style={{ fontWeight: 600 }}>4.6... (42)</span></div>
          <div className="fin-r"><span>Healthgrades</span><span style={{ fontWeight: 600 }}>4.8... (22)</span></div>
          <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Request a Review</button>
        </div>
      </div>
    </>
  )
}

