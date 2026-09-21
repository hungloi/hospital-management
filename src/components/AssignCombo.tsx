'use client';

import React from 'react';

export default function AssignCombo({ appointmentId, currentComboId }: { appointmentId: string; currentComboId?: string | null }) {
  const [combos, setCombos] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<string | null>(currentComboId ?? null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    fetch('/api/admin/combos').then(r => r.json()).then(data => { if (mounted) setCombos(data || []); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  async function assign() {
    if ((selected ?? '') === (currentComboId ?? '')) {
      // nothing to do
      return;
    }
    const ok = window.confirm(`Xác nhận gán gói dịch vụ cho lịch khám?`);
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/appointments/assign-combo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ appointmentId, comboId: selected }) });
      if (!res.ok) throw new Error('assign failed');
      // reload page to reflect changes (server component table)
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Gán gói thất bại');
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <select value={selected ?? ''} onChange={e => setSelected(e.target.value || null)}>
        <option value="">— Không —</option>
        {combos.map(c => (<option key={c.id} value={c.id}>{c.name} — {Number(c.price).toLocaleString('vi-VN')}</option>))}
      </select>
      <button onClick={assign} disabled={loading} style={{ padding: '0.35rem 0.6rem' }}>{loading ? '...' : 'Gán'}</button>
    </div>
  );
}
