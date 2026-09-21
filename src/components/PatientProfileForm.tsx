'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PatientProfileForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setName(session.user.name || '');
      setEmail((session.user as any).email || '');
      setPhone((session.user as any).phone || '');
    }
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, patientId: session?.user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Cập nhật thất bại');
      setMessage('Cập nhật hồ sơ thành công');
      // use returned user from PUT response to update UI immediately (avoid extra GET)
      try {
        const usr = data?.user || { id: session?.user?.id, name, email, phone };
        try { localStorage.setItem('currentUser', JSON.stringify(usr)); } catch (e) {}
        try { window.dispatchEvent(new CustomEvent('profile-updated', { detail: usr })); } catch (e) {}
      } catch (e) {
        try { window.dispatchEvent(new CustomEvent('profile-updated', { detail: { name, email, phone } })); } catch (er) {}
      }

      // navigate back to dashboard (full load) as fallback
      window.setTimeout(() => {
        try { window.location.assign('/patient'); } catch (e) { /* fallback */ }
      }, 700);
    } catch (err: any) {
      setMessage(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '700px', display: 'grid', gap: '1rem' }}>
      {message && <div style={{ padding: '0.75rem', background: '#ecfdf5', color: '#065f46', borderRadius: '8px' }}>{message}
        <div style={{ marginTop: '0.5rem' }}>
          <button type="button" onClick={() => router.push('/patient')} style={{ padding: '0.5rem 0.75rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#0f4fd6', fontWeight: 700 }}>Quay về</button>
        </div>
      </div>}
      <div>
        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Họ và tên</label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', width: '100%', borderRadius: '8px', border: '1px solid #e6e9ee' }} />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.75rem', width: '100%', borderRadius: '8px', border: '1px solid #e6e9ee' }} />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Số điện thoại</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '0.75rem', width: '100%', borderRadius: '8px', border: '1px solid #e6e9ee' }} />
      </div>
      <div>
        <button type="submit" disabled={loading} style={{ padding: '0.75rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700 }}>
          {loading ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </div>
    </form>
  );
}
