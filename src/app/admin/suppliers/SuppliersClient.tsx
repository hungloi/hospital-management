'use client';
import useSWR from 'swr';
import React from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SuppliersClient() {
  const { data: suppliers = [], mutate } = useSWR('/api/admin/suppliers', fetcher);
  const [form, setForm] = React.useState({ name: '', phone: '', email: '' });

  async function create(e: any) {
    e.preventDefault();
    const res = await fetch('/api/admin/suppliers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) {
      alert('Tạo nhà cung cấp thành công');
      setForm({ name: '', phone: '', email: '' });
      mutate();
    } else {
      alert(data.error || 'Lỗi');
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
      <form onSubmit={create} style={{ background: 'white', padding: '1rem', borderRadius: '10px' }}>
        <h3>Thêm nhà cung cấp mới</h3>
        <input placeholder="Tên" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Số điện thoại" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <button style={{ marginTop: '0.5rem' }}>Tạo</button>
      </form>

      <div style={{ background: 'white', padding: '1rem', borderRadius: '10px' }}>
        <h3>Danh sách nhà cung cấp</h3>
        {suppliers.length === 0 ? <p>Chưa có dữ liệu</p> : suppliers.map((s: any) => (
          <div key={s.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eef2f7' }}>
            <div style={{ fontWeight: 700 }}>{s.name}</div>
            <div style={{ color: '#64748b' }}>{s.contactPerson || s.phone || s.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
