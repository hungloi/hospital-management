'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDoctor } from '@/app/actions/adminActions';

export default function NewDoctorForm({ users, departments }: { users: any[], departments: any[] }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createDoctor(formData);
    
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      router.push('/admin/doctors');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Chọn Tài khoản Bác sĩ *</label>
        <select name="userId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
          <option value="">-- Chọn tài khoản --</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
        {users.length === 0 && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>Không có tài khoản nào có vai trò DOCTOR hoặc tất cả đã có hồ sơ. Vui lòng thêm người dùng mới trước.</div>}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Chuyên khoa *</label>
        <input name="specialty" required placeholder="Ví dụ: Nội khoa, Da liễu..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Thuốc khoa (Tùy chọn)</label>
        <select name="departmentId" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }}>
          <option value="">-- Không thuộc khoa nào --</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Số giấy phép (License No)</label>
        <input name="licenseNo" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Tiểu sử / Giới thiệu</label>
        <textarea name="bio" rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', color: '#0f172a', outline: 'none' }} />
      </div>

      <button type="submit" disabled={loading || users.length === 0} style={{ marginTop: '1rem', background: '#38bdf8', color: '#0f172a', padding: '0.875rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: loading || users.length === 0 ? 'not-allowed' : 'pointer', opacity: users.length === 0 ? 0.5 : 1 }}>
        {loading ? 'Đang lưu...' : 'Thêm hồ sơ Bác sĩ'}
      </button>
    </form>
  );
}
