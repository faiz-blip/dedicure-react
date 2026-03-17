'use client'

import { useState, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
import { useResource } from '@/hooks/useResource';

type CoachData = {
  modules: { name: string; status: string; actions: number }[]
  accuracy: { model: string; score: number; trend: string }[]
  recentActions: { time: string; module: string; action: string; severity: string }[]
}

interface AiAction {
  time: string;
  module: string;
  action: string;
  severity: 'success' | 'warn' | 'info';
}

export default function AiCoach() {
  const { data, isLoading } = useResource<CoachData>('coach')

  const [actions, setActions] = useState<AiAction[]>([]);

  useEffect(() => {
    if (data?.recentActions) setActions(data.recentActions as AiAction[]);
  }, [data]);

  const { generateContent, isLoading: aiLoading, error } = useAI({
    systemInstruction: `You are Dedicure AI, an advanced dental practice management AI assistant. 
    Generate a JSON array of 3 realistic, newly logged AI actions for a dental practice.
    Format exactly like this, returning ONLY valid JSON:
    [
      { "time": "HH:MM AM/PM", "module": "Module Name", "action": "Description of what happened", "severity": "success" | "warn" | "info" }
    ]`
  });

  const handleGenerate = async () => {
    const prompt = "Generate exactly 3 new recent AI actions for the dental practice dashboard. Return raw JSON array only, no markdown formatting.";
    const result = await generateContent(prompt);
    
    if (result) {
      try {
        // Strip out potential markdown code blocks (e.g. ```json \n ... \n ```)
        const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const newActions: AiAction[] = JSON.parse(cleanJson);
        setActions(prev => [...newActions, ...prev].slice(0, 10)); // Keep top 10 recent
      } catch (err) {
        console.error("Failed to parse AI response:", result, err);
      }
    }
  };

  const modules = data?.modules ?? []
  const accuracy = data?.accuracy ?? []

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-2)' }}>Loading…</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ai-card">
        <div className="ai-head" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="ai-icon"> - </div>
            <div>
              <div className="ai-title">Dedicure AI Command Center</div>
              <div className="ai-sub">11 modules active across Trinity Dental Centers  Live Feed</div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-p"
            onClick={handleGenerate}
            disabled={aiLoading}
            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
          >
            {aiLoading ? 'Generating...' : ' Generate Insights'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, backgroundColor: 'var(--red-100)', color: 'var(--red-500)', borderRadius: 8, fontSize: 13 }}>
          AI Error: {error}
        </div>
      )}

      <div className="g4">
        <div className="card"><div className="metric"><div className="m-lbl">AI Modules Active</div><div className="m-val">11</div><div className="m-sub up">All systems operational</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Actions Logged</div><div className="m-val">{actions.length}</div><div className="m-sub up">Monitored live</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Accuracy</div><div className="m-val">94.2%</div><div className="m-sub up">+0.3% this week</div></div></div>
        <div className="card"><div className="metric"><div className="m-lbl">Time Saved</div><div className="m-val">2.4 hrs</div><div className="m-sub up">Today across all modules</div></div></div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-h"><span className="sec-t">Active AI Modules</span></div>
          {modules.map((m, i) => (
            <div key={i} className="fin-r" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: m.status === 'active' ? 'var(--green-400)' : 'var(--text3)', fontSize: 10 }}> - </span>
                <span style={{ fontSize: 14 }}>{m.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {m.actions > 0 && <span className="badge bb">{m.actions} actions</span>}
                <span className={`badge ${m.status === 'active' ? 'bg' : 'bx'}`}>{m.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h">
              <span className="sec-t">AI Actions Live Feed</span>
              {aiLoading && <span style={{ fontSize: 12, color: 'var(--text3)' }}>Syncing...</span>}
            </div>
            {actions.map((a, i) => (
               <div key={i} className="ai-item" style={{ animation: i === 0 ? 'fadeIn 0.5s ease-out' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className={`badge ${a.severity === 'success' ? 'bg' : a.severity === 'warn' ? 'ba' : 'bb'}`} style={{ marginRight: 6 }}>{a.module}</span>
                    <span style={{ fontSize: 13 }}>{a.action}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', marginLeft: 8 }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-h"><span className="sec-t">Model Accuracy</span></div>
            {accuracy.map((a, i) => (
              <div key={i} className="fin-r" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13 }}>{a.model}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="pw" style={{ width: 80 }}><div className="pf pf-g" style={{ width: `${a.score}%` }} /></div>
                  <span style={{ fontSize: 13, fontFamily: 'var(--mono)', width: 44, textAlign: 'right' }}>{a.score}%</span>
                  <span className={`m-sub ${a.trend === 'up' ? 'up' : ''}`}>{a.trend === 'up' ? '-' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

