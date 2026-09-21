'use client';

import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminCombosPage() {
  const { data: combos } = useSWR('/api/admin/combos', fetcher);
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [price, setPrice] = React.useState(0);

  async function create() {
    await fetch('/api/admin/combos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, description: desc, price }) });
    setName(''); setDesc(''); setPrice(0);
    (window as any).location.reload();
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Quản lý gói dịch vụ (Combo)</h1>
      <div style={{ marginTop: '1rem' }}>
        <input placeholder="Tên gói" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Mô tả" value={desc} onChange={e=>setDesc(e.target.value)} />
        <input type="number" placeholder="Giá" value={price} onChange={e=>setPrice(Number(e.target.value))} />
        <button onClick={create}>Tạo gói</button>
      </div>

      <table style={{ marginTop: '1rem' }}>
        <thead><tr><th>Tên</th><th>Mô tả</th><th>Giá</th></tr></thead>
        <tbody>
          {combos && combos.map((c: any)=>(<tr key={c.id}><td>{c.name}</td><td>{c.description}</td><td>{Number(c.price).toLocaleString('vi-VN')}</td></tr>))}
        </tbody>
      </table>
    </div>
  );
}
