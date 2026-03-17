'use client'
import { useState } from 'react'
import { useMessages, SmsMessage } from '@/hooks/useMessaging'
import api from '@/lib/api'

const TEMPLATES = ['Confirm appt', 'Balance due', 'Lab case ready', 'Recall reminder', 'Post-op instructions', 'Review request']

function fmtTime(iso: string) {
  if (!iso || iso.startsWith('0001')) return ''
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AV_COLORS = ['av-g', 'av-b', 'av-a', 'av-p']

export default function Messaging() {
  const { messages, isLoading, isError, mutate } = useMessages()
  const [activePatNum, setActivePatNum] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [aiDismissed, setAiDismissed] = useState(false)

  const allMsgs = messages ?? []

  // Group by patient  one entry per patient with their latest message
  const byPatient = allMsgs.reduce<Record<number, SmsMessage[]>>((acc, m) => {
    if (!acc[m.PatNum]) acc[m.PatNum] = []
    acc[m.PatNum].push(m)
    return acc
  }, {})

  const conversations = Object.entries(byPatient).map(([patNum, msgs]) => {
    const sorted = [...msgs].sort((a, b) => new Date(b.DateTimeSent || b.DateTimeReceived).getTime() - new Date(a.DateTimeSent || a.DateTimeReceived).getTime())
    const latest = sorted[0]
    const unread = msgs.filter(m => m.MsgType === 1 && m.SmsStatus !== 2).length
    return { patNum: Number(patNum), name: latest.PatientName ?? `Patient #${patNum}`, latest, unread, msgs: sorted }
  }).sort((a, b) => new Date(b.latest.DateTimeSent || b.latest.DateTimeReceived).getTime() - new Date(a.latest.DateTimeSent || a.latest.DateTimeReceived).getTime())

  const activeConv = conversations.find(c => c.patNum === activePatNum) ?? conversations[0] ?? null

  const { messages: threadMsgs } = useMessages(activeConv?.patNum)

  const send = async () => {
    if (!input.trim() || !activeConv) return
    setSending(true)
    await api.post('/smsmessages', {
      PatNum: activeConv.patNum,
      MobilePhoneNumber: activeConv.latest.MobilePhoneNumber,
      MessageText: input.trim(),
      MsgType: 0,
    })
    setInput('')
    setSending(false)
    mutate()
  }

  const unreadTotal = allMsgs.filter(m => m.MsgType === 1 && m.SmsStatus !== 2).length

  return (
    <>
      <div className="g4" style={{ marginBottom: 14 }}>
        <div className="metric"><div className="m-lbl">Unread Messages</div><div className="m-val dn">{unreadTotal}</div></div>
        <div className="metric"><div className="m-lbl">Total Conversations</div><div className="m-val">{conversations.length}</div></div>
        <div className="metric"><div className="m-lbl">Sent Today</div><div className="m-val">{allMsgs.filter(m => m.MsgType === 0 && fmtTime(m.DateTimeSent).includes(':')).length}</div></div>
        <div className="metric"><div className="m-lbl">Response Rate</div><div className="m-val up"></div></div>
      </div>

      <div className="row">
        {/* Conversation list */}
        <div className="card fixed" style={{ width: 272 }}>
          <div className="card-h">
            <div className="sec-t">Conversations</div>
            <button className="btn btn-sm btn-p">+ New</button>
          </div>

          {isLoading && <div style={{ padding: '20px 10px', fontSize: 11, color: 'var(--text3)' }}>Loading messages...</div>}
          {isError   && <div style={{ padding: '20px 10px', fontSize: 11, color: 'var(--red-400)' }}>Failed to load messages.</div>}

          {conversations.map((c, idx) => {
            const isActive = (activePatNum === null && idx === 0) || activePatNum === c.patNum
            const preview = c.latest.MessageText.slice(0, 48) + (c.latest.MessageText.length > 48 ? '' : '')
            return (
              <div
                key={c.patNum}
                onClick={() => setActivePatNum(c.patNum)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8,
                  cursor: 'pointer', marginBottom: 3, transition: 'all .1s',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                }}
              >
                <div className={`av ${AV_COLORS[idx % AV_COLORS.length]}`} style={{ flexShrink: 0 }}>{initials(c.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? 'var(--accent)' : 'var(--text)' }}>{c.name}</span>
                    <span style={{ fontSize: 9, color: 'var(--text3)' }}>{fmtTime(c.latest.DateTimeSent || c.latest.DateTimeReceived)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</div>
                </div>
                {c.unread > 0 && (
                  <span style={{ background: 'var(--red-400)', color: '#fff', borderRadius: 99, fontSize: 9, fontWeight: 700, padding: '2px 6px', flexShrink: 0 }}>{c.unread}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Active conversation */}
        <div className="card grow" style={{ display: 'flex', flexDirection: 'column' }}>
          {activeConv ? (
            <>
              <div className="card-h">
                <div>
                  <div className="sec-t">{activeConv.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{activeConv.latest.MobilePhoneNumber || 'No phone on file'}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm">View Chart</button>
                </div>
              </div>

              {!aiDismissed && (
                <div className="alert al-p" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span><span style={{ marginRight: 6 }}>*</span><strong>AI suggests:</strong> &quot;Hi {activeConv.name.split(' ')[0]}, just following up  let us know if you have any questions!&quot;</span>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-sm btn-p" onClick={() => { setInput(`Hi ${activeConv.name.split(' ')[0]}, just following up  let us know if you have any questions!`); setAiDismissed(true) }}>Use</button>
                    <button className="btn btn-sm" onClick={() => setAiDismissed(true)}>Dismiss</button>
                  </div>
                </div>
              )}

              <div className="msg-thread" style={{ flex: 1 }}>
                {(threadMsgs ?? activeConv.msgs).map((m: SmsMessage) => (
                  <div key={m.SmsMessageNum} className={m.MsgType === 0 ? 'msg-out' : 'msg-in'}>
                    {m.MessageText}
                    <div style={{ fontSize: 10, opacity: .65, marginTop: 4, textAlign: m.MsgType === 0 ? 'right' : 'left' }}>
                      {fmtTime(m.DateTimeSent || m.DateTimeReceived)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    className="inp"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder={`Message ${activeConv.name.split(' ')[0]}...`}
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-sm btn-p" onClick={send} disabled={sending || !input.trim()}>
                    {sending ? '...' : 'Send <-'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TEMPLATES.map(t => (
                    <button key={t} className="btn btn-sm" style={{ fontSize: 10 }} onClick={() => setInput(t)}>{t}</button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>
              {isLoading ? 'Loading...' : 'No conversations yet. Send a message to get started.'}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
