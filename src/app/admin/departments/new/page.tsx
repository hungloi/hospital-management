'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import { createDepartment } from '@/app/actions/adminActions';
import Link from 'next/link';




export default function NewDepartmentPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createDepartment(formData);
    
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      router.push('/admin/departments');
    }
  };

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME}>
      <div style={{ padding: '2rem', color: '#0f172a', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/admin/departments" style={{ color: '#64748b', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Thêm Khoa mới</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Tên Khoa *</label>
            <input name="name" required placeholder="Ví dụ: Khoa Nội, Khoa Nhi..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Vị trí / Tầng</label>
            <input name="floor" placeholder="Ví dụ: Tầng 2, Dãy B" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Mô tả</label>
            <textarea name="description" rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: '1rem', background: '#38bdf8', color: '#0f172a', padding: '0.875rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Đang lưu...' : 'Thêm Khoa'}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}


