'use client';

import React from 'react';

export default function LabServicesAdmin() {
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<Record<string, number>>({});

  async function load() {
    try {
      const res = await fetch('/api/admin/combos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'getLabTypes' }) });
      const data = await res.json();
      setServices(data || []);
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => { load(); }, []);

  async function save(type: string) {
    const price = editing[type] ?? 0;
    if (price < 0) { alert('Giá không hợp lệ'); return; }
    const ok = window.confirm(`Xác nhận lưu giá ${price.toLocaleString('vi-VN')} cho ${type}?`);
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/combos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'updateLabPrice', type, price }) });
      if (!res.ok) throw new Error('save failed');
      await load();
      alert('Lưu thành công');
    } catch (e) {
      console.error(e);
      alert('Lưu thất bại');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ marginTop: '1.5rem', background: '#0b1220', padding: '1rem', borderRadius: '12px', border: '1px solid #23303b' }}>
      <h3 style={{ color: '#cbd5e1' }}>Giá dịch vụ xét nghiệm (Lab services)</h3>
      <p style={{ color: '#94a3b8', marginTop: '6px' }}>Danh sách các loại xét nghiệm hiện có trong hệ thống. Thiết lập giá để itemize hóa hóa đơn chính xác.</p>
      <div style={{ marginTop: '0.75rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={{ textAlign: 'left', color: '#94a3b8' }}>Loại</th><th style={{ textAlign: 'left', color: '#94a3b8' }}>Giá</th><th /></tr></thead>
          <tbody>
            {services.map(s => (
              <tr key={s.type} style={{ borderTop: '1px solid #23303b' }}>
                <td style={{ padding: '0.6rem 0' }}><strong style={{ color: '#fff' }}>{s.type}</strong></td>
                <td>
                  <input type="number" value={editing[s.type] ?? (s.price ?? 0)} onChange={e => setEditing(prev => ({ ...prev, [s.type]: Number(e.target.value) }))} style={{ width: '160px' }} />
                </td>
                <td><button onClick={() => save(s.type)} disabled={loading} style={{ padding: '0.35rem 0.6rem' }}>{loading ? '...' : 'Lưu'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
