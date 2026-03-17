'use client';
import { useState } from 'react';

type Tab = 'Organization' | 'Users & Roles' | 'Security' | 'Notifications' | 'Integrations' | 'Billing';

type StaffUser = { name: string; role: string; email: string; lastLogin: string; twoFA: boolean; status: 'Active' | 'Inactive' };

const STAFF: StaffUser[] = [
  { name: 'Dr. Anita Nguyen', role: 'Owner / Doctor', email: 'anguyen@trinitydental.com', lastLogin: '2 min ago', twoFA: true, status: 'Active' },
  { name: 'Dr. Marcus Chen', role: 'Associate Doctor', email: 'mchen@trinitydental.com', lastLogin: 'Today 8:12 AM', twoFA: true, status: 'Active' },
  { name: 'Keisha Okafor', role: 'Office Manager', email: 'kokafor@trinitydental.com', lastLogin: 'Today 7:58 AM', twoFA: true, status: 'Active' },
  { name: 'Melissa Reyes', role: 'Front Desk', email: 'mreyes@trinitydental.com', lastLogin: 'Today 8:05 AM', twoFA: true, status: 'Active' },
  { name: 'Lena Torres', role: 'Dental Hygienist', email: 'ltorres@trinitydental.com', lastLogin: 'Mar 14, 5:30 PM', twoFA: false, status: 'Active' },
  { name: 'David Osei', role: 'Dental Assistant', email: 'dosei@trinitydental.com', lastLogin: 'Mar 14, 4:55 PM', twoFA: true, status: 'Active' },
  { name: 'Carmen Vega', role: 'Billing Coordinator', email: 'cvega@trinitydental.com', lastLogin: 'Today 8:20 AM', twoFA: true, status: 'Active' },
  { name: 'James Whitfield', role: 'Dental Hygienist', email: 'jwhitfield@trinitydental.com', lastLogin: 'Mar 13, 5:00 PM', twoFA: true, status: 'Active' },
  { name: 'Sandra Patel', role: 'Front Desk', email: 'spatel@trinitydental.com', lastLogin: 'Today 7:50 AM', twoFA: false, status: 'Active' },
  { name: 'Robert Kim', role: 'Dental Assistant', email: 'rkim@trinitydental.com', lastLogin: 'Mar 14, 4:30 PM', twoFA: true, status: 'Active' },
  { name: 'Linda Harmon', role: 'Insurance Coordinator', email: 'lharmon@trinitydental.com', lastLogin: 'Today 8:00 AM', twoFA: true, status: 'Active' },
  { name: 'Tyler Brooks', role: 'Front Desk', email: 'tbrooks@trinitydental.com', lastLogin: 'Mar 10, 3:00 PM', twoFA: false, status: 'Inactive' },
];

type ToggleItem = { label: string; desc: string; key: string };
const NOTIF_ITEMS: ToggleItem[] = [
  { label: 'Daily Production Summary', desc: 'Sent each morning at 7:30 AM with previous day\'s production totals', key: 'daily_prod' },
  { label: 'Missed Appointment Alerts', desc: 'Real-time notification when a patient no-shows or cancels same-day', key: 'missed_appt' },
  { label: 'A/R Threshold Alert', desc: 'Alert when A/R over 60 days exceeds $15,000 across all locations', key: 'ar_alert' },
  { label: 'Low Inventory Alerts', desc: 'Notify when any supply drops below reorder threshold in Patterson', key: 'inventory' },
  { label: 'New Patient Booked', desc: 'Notification when a new patient is scheduled for the first time', key: 'new_pt' },
  { label: 'Integration Errors', desc: 'Alert when any connected integration fails to sync or returns an error', key: 'integ_error' },
  { label: 'Weekly Scorecard Email', desc: 'Weekly summary of KPIs, trends, and highlights emailed to admins', key: 'weekly_email' },
  { label: 'Security Login Alerts', desc: 'Email alert when a new device or unusual location logs into the platform', key: 'security_login' },
];

export default function Settings() {
  const [tab, setTab] = useState<Tab>('Organization');
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    daily_prod: true, missed_appt: true, ar_alert: true, inventory: true,
    new_pt: false, integ_error: true, weekly_email: true, security_login: true,
  });

  const tabs: Tab[] = ['Organization', 'Users & Roles', 'Security', 'Notifications', 'Integrations', 'Billing'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="sec-t">Settings</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>Manage your organization, users, and security preferences</div>
        </div>
        <button className="btn btn-sm btn-p">Save Changes</button>
      </div>

      <div className="g4">
        {[
          { label: 'Users', value: '12', sub: 'Across all locations' },
          { label: 'Admins', value: '2', sub: 'Dr. Nguyen + K. Okafor' },
          { label: '2FA Enabled', value: '9 / 12', sub: '3 users pending setup' },
          { label: 'Last Login', value: '2 min ago', sub: 'Dr. Anita Nguyen' },
        ].map(m => (
          <div className="card metric" key={m.label}>
            <div className="m-lbl">{m.label}</div>
            <div className="m-val">{m.value}</div>
            <div className="m-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="subtabs">
        {tabs.map(t => (
          <div key={t} className={`stab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {tab === 'Organization' && (
        <div className="g2">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card-h">Practice Information</div>
            {[
              { lbl: 'Practice Name', val: 'Trinity Dental Centers' },
              { lbl: 'Primary NPI', val: '1234567890' },
              { lbl: 'Tax ID (EIN)', val: '**-***7842' },
              { lbl: 'DEA Number', val: 'BT1234567' },
            ].map(f => (
              <div className="fgrp" key={f.lbl}>
                <label className="flbl">{f.lbl}</label>
                <input className="inp" defaultValue={f.val} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-h">Locations</div>
              {[
                { name: 'Trinity Sealy', addr: '401 Main St, Sealy, TX 77474', npi: '1345678901' },
                { name: 'Main Office', addr: '820 Oak Blvd, Katy, TX 77449', npi: '1456789012' },
                { name: 'North Campus', addr: '1105 Highway 36, Bellville, TX 77418', npi: '1567890123' },
              ].map((loc, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{loc.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{loc.addr}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>NPI: {loc.npi}</div>
                </div>
              ))}
              <button className="btn btn-sm" style={{ marginTop: 10 }}>+ Add Location</button>
            </div>
            <div className="card">
              <div className="card-h">Practice Logo</div>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}></div>
                Drop logo here or <span style={{ color: 'var(--blue-600)', cursor: 'pointer' }}>browse files</span>
                <div style={{ fontSize: 11, marginTop: 4 }}>PNG or SVG, max 2 MB, recommended 200 - 60px</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Users & Roles' && (
        <div className="card">
          <div className="row" style={{ marginBottom: 16 }}>
            <div className="card-h" style={{ margin: 0 }}>Staff Users</div>
            <button className="btn btn-sm btn-p">+ Invite User</button>
          </div>
          <div className="tw">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Last Login</th><th>2FA</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {STAFF.map(u => (
                  <tr key={u.email}>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <div className={`av av-${['g','b','p','a'][u.name.charCodeAt(0) % 4]}`}>{u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text2)' }}>{u.role}</td>
                    <td style={{ fontSize: 12, fontFamily: 'var(--mono)' }}>{u.email}</td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{u.lastLogin}</td>
                    <td><span className={`badge ${u.twoFA ? 'bg' : 'br'}`} style={{ fontSize: 10 }}>{u.twoFA ? 'On' : 'Off'}</span></td>
                    <td><span className={`badge ${u.status === 'Active' ? 'bg' : 'bx'}`} style={{ fontSize: 10 }}>{u.status}</span></td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm" style={{ fontSize: 11 }}>Edit</button>
                      <button className="btn btn-sm" style={{ fontSize: 11 }}>Reset PW</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Security' && (
        <div className="g2">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card-h">Password Policy</div>
            {[
              { lbl: 'Minimum Length', val: '12 characters' },
              { lbl: 'Require Uppercase', val: 'Yes' },
              { lbl: 'Require Numbers & Symbols', val: 'Yes' },
              { lbl: 'Password Expiry', val: 'Every 90 days' },
              { lbl: 'History (no reuse)', val: 'Last 10 passwords' },
            ].map(f => (
              <div key={f.lbl} className="row" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>{f.lbl}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{f.val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-h">Access Controls</div>
              {[
                { lbl: 'Require 2FA for all users', val: 'Enforced' },
                { lbl: 'Session timeout', val: '30 minutes idle' },
                { lbl: 'IP allowlist', val: 'Disabled' },
                { lbl: 'Single Sign-On (SSO)', val: 'Google Workspace' },
              ].map((f, i, arr) => (
                <div key={f.lbl} className="row" style={{ padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{f.lbl}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{f.val}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-h">Audit</div>
              <div className="alert al-i" style={{ fontSize: 12, marginBottom: 12 }}>Full audit logs are stored for 6 years per HIPAA requirements. Logs are tamper-proof and encrypted at rest.</div>
              <button className="btn btn-sm" style={{ width: '100%' }}>View Audit Log</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'Notifications' && (
        <div className="card">
          <div className="card-h">Notification Preferences</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {NOTIF_ITEMS.map((item, i) => (
              <div key={item.key} className="row" style={{ padding: '14px 0', borderBottom: i < NOTIF_ITEMS.length - 1 ? '1px solid var(--border)' : 'none', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <div
                  onClick={() => setNotifs(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  style={{
                    width: 40, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0,
                    background: notifs[item.key] ? 'var(--green-400)' : 'var(--border)',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: notifs[item.key] ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Integrations' && (
        <div className="alert al-i" style={{ fontSize: 13 }}>
          Manage connected integrations on the dedicated <strong>Integrations</strong> page from the main navigation. All active connections and sync status are visible there.
        </div>
      )}

      {tab === 'Billing' && (
        <div className="g2">
          <div className="card">
            <div className="card-h">Current Plan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="row"><span style={{ fontSize: 13, color: 'var(--text2)' }}>Plan</span><span style={{ fontWeight: 700, fontSize: 15 }}>Dedicure DSO Pro</span></div>
              <div className="row"><span style={{ fontSize: 13, color: 'var(--text2)' }}>Billing Cycle</span><span style={{ fontWeight: 600 }}>Annual  renews Jan 1, 2027</span></div>
              <div className="row"><span style={{ fontSize: 13, color: 'var(--text2)' }}>Monthly Cost</span><span style={{ fontWeight: 700, fontSize: 16 }}>$399 / month</span></div>
              <div className="row"><span style={{ fontSize: 13, color: 'var(--text2)' }}>Locations</span><span className="badge bg">3 of 5 included</span></div>
              <div className="row"><span style={{ fontSize: 13, color: 'var(--text2)' }}>Users</span><span className="badge bg">12 of 25 included</span></div>
              <div className="divider" />
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-sm btn-p">Upgrade Plan</button>
                <button className="btn btn-sm">View Invoices</button>
                <button className="btn btn-sm">Update Payment</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-h">Payment Method</div>
            <div className="alert al-s" style={{ fontSize: 12, marginBottom: 12 }}>Visa ending in 4242  -  Expires 09/2028  -  Auto-pay enabled</div>
            <button className="btn btn-sm">Replace Card</button>
          </div>
        </div>
      )}
    </div>
  );
}

