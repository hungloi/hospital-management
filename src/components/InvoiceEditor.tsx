'use client';

import React from 'react';

export default function InvoiceEditor({ appointmentId }: { appointmentId: string }) {
  const [invoice, setInvoice] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/combos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'getInvoiceByAppointment', appointmentId }) });
      const data = await res.json();
      setInvoice(data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  React.useEffect(() => { if (appointmentId) load(); }, [appointmentId]);

  async function saveItem(itemId: string, updates: any) {
    try {
      const body: any = { action: 'updateInvoiceItem', itemId, ...updates };
      const res = await fetch('/api/admin/combos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      setInvoice(data);
    } catch (e) {
      console.error(e);
      alert('Lưu thất bại');
    }
  }

  if (loading) return <div style={{ color: '#94a3b8' }}>Đang tải hóa đơn...</div>;
  if (!invoice) return <div style={{ color: '#94a3b8' }}>Không tìm thấy hóa đơn</div>;

  return (
    <div style={{ marginTop: '0.6rem', background: '#071026', padding: '0.75rem', borderRadius: 8, border: '1px solid #223043' }}>
      <h4 style={{ color: '#cbd5e1' }}>Hóa đơn: {invoice.id}</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={{ color: '#94a3b8', textAlign: 'left' }}>Mô tả</th><th style={{ color: '#94a3b8' }}>Số lượng</th><th style={{ color: '#94a3b8' }}>Đơn giá</th><th /></tr></thead>
        <tbody>
          {invoice.items.map((it: any) => (
            <tr key={it.id} style={{ borderTop: '1px solid #223043' }}>
              <td>
                <input value={it.description} onChange={e => setInvoice((prev:any)=> ({...prev, items: prev.items.map((x:any)=> x.id===it.id?{...x, description: e.target.value}:x)}))} style={{ width: '100%' }} />
              </td>
              <td style={{ textAlign: 'center' }}>
                <input type="number" value={it.quantity} onChange={e => setInvoice((prev:any)=> ({...prev, items: prev.items.map((x:any)=> x.id===it.id?{...x, quantity: Number(e.target.value)}:x)}))} style={{ width: '80px' }} />
              </td>
              <td style={{ textAlign: 'right' }}>
                <input type="number" value={it.amount} onChange={e => setInvoice((prev:any)=> ({...prev, items: prev.items.map((x:any)=> x.id===it.id?{...x, amount: Number(e.target.value)}:x)}))} style={{ width: '120px' }} />
              </td>
              <td style={{ textAlign: 'right' }}>{Number(it.amount * it.quantity).toLocaleString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cbd5e1' }}>
        <div>
          <button onClick={() => {
            // save all changed items
            const updates = invoice.items.map((it: any) => ({ itemId: it.id, description: it.description, amount: Number(it.amount), quantity: Number(it.quantity) }));
            // sequentially save each item to keep logic simple
            (async () => {
              for (const u of updates) {
                await saveItem(u.itemId, { description: u.description, amount: u.amount, quantity: u.quantity });
              }
              alert('Lưu hóa đơn xong');
            })();
          }} style={{ padding: '0.45rem 0.8rem', marginRight: '0.5rem' }}>Lưu toàn bộ</button>
          <button onClick={load} style={{ padding: '0.35rem 0.6rem' }}>Làm mới</button>
        </div>
        <div>Tổng: {Number(invoice.total).toLocaleString('vi-VN')}</div>
      </div>
    </div>
  );
}
