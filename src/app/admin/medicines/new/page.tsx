'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import { createMedicine } from '@/app/actions/adminActions';
import Link from 'next/link';




export default function NewMedicinePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createMedicine(formData);
    
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      router.push('/admin/medicines');
    }
  };

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME}>
      <div style={{ padding: '2rem', color: '#0f172a', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/admin/medicines" style={{ color: '#64748b', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Thêm Thuốc mới</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Tên Thuốc *</label>
            <input name="name" required placeholder="Ví dụ: Paracetamol 500mg" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Hoạt chất</label>
            <input name="activeIngredient" placeholder="Ví dụ: Paracetamol" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Đơn vị *</label>
            <select name="unit" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
              <option value="Viên">Viên</option>
              <option value="Lọ">Lọ</option>
              <option value="Ống">Ống</option>
              <option value="Gói">Gói</option>
              <option value="Tuýp">Tuýp</option>
              <option value="Chai">Chai</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Mô tả / Hướng dẫn</label>
            <textarea name="description" rows={3} placeholder="Ví dụ: Thuốc giảm đau, hạ sốt..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: '1rem', background: '#38bdf8', color: '#0f172a', padding: '0.875rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Đang lưu...' : 'Thêm Thuốc'}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}


