'use client';
import { useState } from 'react';
import { updateUserAction } from '@/app/actions/adminActions';

const roleColor: Record<string, string> = { 
  ADMIN: '#f59e0b', DOCTOR: '#34d399', PATIENT: '#38bdf8', 
  ACCOUNTANT: '#a855f7', CHIEF_ACCOUNTANT: '#8b5cf6',
  NURSE: '#ec4899', STAFF: '#64748b',
  DIRECTOR: '#ef4444', DEPUTY_DIRECTOR: '#f43f5e',
  HEAD_DOCTOR: '#10b981', DEPUTY_HEAD: '#059669'
};
const roleLabel: Record<string, string> = { 
  ADMIN: '👑 Admin', DOCTOR: '👨‍⚕️ Bác sĩ', PATIENT: '🧑 Bệnh nhân', 
  ACCOUNTANT: '📝 Kế toán', CHIEF_ACCOUNTANT: '💼 Kế toán trưởng',
  NURSE: '💉 Y tá/ĐD', STAFF: '🧑‍💻 Nhân viên',
  DIRECTOR: '🏢 Giám đốc', DEPUTY_DIRECTOR: '🏢 Phó GĐ',
  HEAD_DOCTOR: '⭐ Trưởng khoa', DEPUTY_HEAD: '⭐ Phó khoa'
};

export default function UserDetailClient({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateUserAction(user.id, formData);
    setLoading(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      {/* Avatar Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '200px' }}>
        <div style={{ 
          width: '120px', height: '120px', borderRadius: '50%', 
          background: 'linear-gradient(135deg, #38bdf8, #818cf8)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: '#0f172a', fontSize: '3rem', fontWeight: 700, boxShadow: '0 10px 25px rgba(56,189,248,0.2)' 
        }}>
          {user.name.split(' ').at(-1)?.[0]}
        </div>
        
        <div style={{ 
          background: `${roleColor[user.role] || '#fff'}22`, 
          color: roleColor[user.role] || '#fff', 
          padding: '0.4rem 1rem', borderRadius: '20px', 
          fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' 
        }}>
          {roleLabel[user.role] || user.role}
        </div>
        
        <button 
          onClick={() => setIsEditing(!isEditing)}
          style={{ width: '100%', padding: '0.75rem', background: isEditing ? '#e2e8f0' : '#38bdf8', border: '1px solid #cbd5e1', color: isEditing ? '#0f172a' : '#0f172a', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          {isEditing ? 'Hủy chỉnh sửa' : '✏️ Chỉnh sửa'}
        </button>
      </div>

      {/* Info Area */}
      <div style={{ flex: 1 }}>
        {!isEditing ? (
          <>
            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>{user.name}</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📧 {user.email}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>ĐƠN VỊ CÔNG TÁC</p>
                <p style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 500 }}>
                  {user.doctorInfo?.department?.name || user.doctorInfo?.specialty || 'Ban Giám Đốc / Hành Chính'}
                </p>
              </div>

              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>NGÀY GIA NHẬP</p>
                <p style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 500 }}>
                  {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(user.createdAt))}
                </p>
              </div>

              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>SỐ ĐIỆN THOẠI</p>
                <p style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 500 }}>
                  {user.phone || 'Chưa cập nhật'}
                </p>
              </div>

              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>MÃ NHÂN VIÊN</p>
                <p style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 500, fontFamily: 'monospace' }}>
                  {user.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {user.doctorInfo && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>GIỚI THIỆU (BIO)</p>
                <p style={{ color: '#475569', lineHeight: '1.6' }}>
                  {user.doctorInfo.bio || 'Chưa có thông tin giới thiệu.'}
                </p>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 1rem 0' }}>Chỉnh sửa thông tin</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Họ và tên</label>
                <input name="name" defaultValue={user.name} required style={{ width: '100%', padding: '0.8rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Email (Không thể sửa)</label>
                <input defaultValue={user.email} disabled style={{ width: '100%', padding: '0.8rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#64748b' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Vai trò (Role)</label>
                <select name="role" defaultValue={user.role} style={{ width: '100%', padding: '0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }}>
                  {Object.entries(roleLabel).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Số điện thoại</label>
                <input name="phone" defaultValue={user.phone || ''} style={{ width: '100%', padding: '0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#64748b', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Đổi mật khẩu mới (Bỏ trống nếu không đổi)</label>
              <input name="password" type="password" placeholder="Nhập mật khẩu mới..." style={{ width: '100%', padding: '0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
              <button type="submit" disabled={loading} style={{ padding: '0.8rem 1.5rem', background: '#38bdf8', color: '#0f172a', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
