'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { createUser } from '@/app/actions/adminActions';
import Link from 'next/link';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';



export default function NewUserPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createUser(formData);
    
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      router.push('/admin/users');
    }
  };

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME}>
      <div style={{ padding: '2rem', color: '#0f172a', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/admin/users" style={{ color: '#64748b', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Thêm người dùng mới</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Họ và tên *</label>
            <input name="name" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Email đăng nhập *</label>
            <input type="email" name="email" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Mật khẩu *</label>
            <input type="password" name="password" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Vai trò *</label>
            <select name="role" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
              <option value="PATIENT">Bệnh nhân</option>
              <option value="DOCTOR">Bác sĩ</option>
              <option value="ACCOUNTANT">Kế toán</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Số điện thoại</label>
            <input type="tel" name="phone" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: '1rem', background: '#38bdf8', color: '#0f172a', padding: '0.875rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Đang lưu...' : 'Thêm tài khoản'}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}

