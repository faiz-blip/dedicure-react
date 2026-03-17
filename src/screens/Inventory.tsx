'use client';
import { useState } from 'react';
import { useResource } from '@/hooks/useResource';

type ItemStatus = 'OK' | 'Low Stock' | 'Out of Stock' | 'On Order';

type InvData = {
  items: { name: string; category: string; sku: string; onHand: number; parLevel: number; reorderPoint: number; status: string; supplier: string; lastOrder: string; unit: string }[]
  suppliers: { name: string; rep: string; phone: string }[]
}

const statusBadge = (s: ItemStatus) => {
  const m = { 'OK': 'badge bg', 'Low Stock': 'badge ba', 'Out of Stock': 'badge br', 'On Order': 'badge bb' };
  return m[s];
};

const categories = ['All', 'PPE', 'Composites', 'Cements', 'Anesthetics', 'Impression Materials', 'Instruments'];

export default function Inventory() {
  const { data, isLoading } = useResource<InvData>('inventory');
  const [catFilter, setCatFilter] = useState('All');
  const [showUrgent, setShowUrgent] = useState(false);

  if (isLoading) return <div className="p-8 text-center" style={{color:'var(--text-2)'}}>Loading…</div>

  const items = data?.items ?? [];
  let visible = catFilter === 'All' ? items : items.filter(i => i.category === catFilter);
  if (showUrgent) visible = visible.filter(i => i.status === 'Out of Stock' || i.status === 'Low Stock');

  return (
    <div>
      <div className="row" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Supply Inventory</div>
          <div style={{ color: 'var(--text2)', marginTop: 2 }}>284 SKUs tracked  March 15, 2026</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm btn-p">+ Place Order</button>
          <button className="btn btn-sm" onClick={() => setShowUrgent(!showUrgent)}>
            {showUrgent ? 'Show All' : 'Show Urgent Only'}
          </button>
          <button className="btn btn-sm">Export</button>
        </div>
      </div>

      <div className="g4" style={{ marginBottom: 24 }}>
        {[['Total SKUs', '284', 'Across all categories', ''], ['Low Stock', '12', 'Below reorder point', 'dn'], ['Out of Stock', '3', 'Needs immediate order', 'dn'], ['Monthly Spend', '$3,840', '+$210 vs Feb', 'dn']].map(([lbl, val, sub, dir]) => (
          <div className="card" key={lbl}><div className="metric"><div className="m-lbl">{lbl}</div><div className="m-val">{val}</div><div className={`m-sub ${dir}`}>{sub}</div></div></div>
        ))}
      </div>

      <div className="alert al-d" style={{ marginBottom: 16 }}>
        <strong>Urgent Reorder Required:</strong> Filtek A3 composite, Filtek B1 composite, and PVS Light Body impression material are OUT OF STOCK. These are needed for scheduled procedures this week.
      </div>

      <div className="row" style={{ gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div className="card">
            <div className="card-h">
              <span className="sec-t">Inventory Items</span>
              <div className="subtabs">
                {categories.map(c => <button key={c} className={`stab${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>)}
              </div>
            </div>
            <div className="tw">
              <table>
                <thead><tr><th>Item</th><th>Category</th><th>SKU</th><th>On Hand</th><th>Par</th><th>Reorder Pt</th><th>Unit</th><th>Status</th><th>Supplier</th><th>Last Order</th><th>Action</th></tr></thead>
                <tbody>
                  {visible.map(item => (
                    <tr key={item.sku} style={item.status === 'Out of Stock' ? { background: '#fff5f5' } : item.status === 'Low Stock' ? { background: '#fffbf0' } : {}}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</td>
                      <td><span className="badge bx">{item.category}</span></td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{item.sku}</td>
                      <td style={{ fontWeight: 700, color: item.onHand === 0 ? 'var(--red-400)' : item.onHand <= item.reorderPoint ? 'var(--amber-400)' : 'inherit' }}>{item.onHand}</td>
                      <td style={{ color: 'var(--text3)' }}>{item.parLevel}</td>
                      <td style={{ color: 'var(--text3)' }}>{item.reorderPoint}</td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{item.unit}</td>
                      <td><span className={statusBadge(item.status as ItemStatus)}>{item.status}</span></td>
                      <td style={{ fontSize: 12 }}>{item.supplier}</td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{item.lastOrder}</td>
                      <td><button className="btn btn-sm">{item.status === 'Out of Stock' || item.status === 'Low Stock' ? 'Order Now' : 'Manage'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ width: 220 }}>
          <div className="card">
            <div className="sec-t" style={{ marginBottom: 12 }}>Supplier Contacts</div>
            {(data?.suppliers ?? []).map(s => (
              <div key={s.name} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.rep}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{s.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
