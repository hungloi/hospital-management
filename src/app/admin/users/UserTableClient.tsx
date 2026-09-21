'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  doctorInfo: { specialty: string; departmentId: string | null } | null;
};

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

export default function UserTableClient({ initialUsers }: { initialUsers: UserData[] }) {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    let sortableItems = [...initialUsers];
    
    // Filter
    if (filterRole !== 'ALL') {
      sortableItems = sortableItems.filter(u => u.role === filterRole);
    }
    if (searchQuery) {
      sortableItems = sortableItems.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sort
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof UserData];
        let bValue: any = b[sortConfig.key as keyof UserData];

        if (sortConfig.key === 'specialty') {
          aValue = a.doctorInfo?.specialty || '';
          bValue = b.doctorInfo?.specialty || '';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [initialUsers, sortConfig, filterRole, searchQuery]);

  return (
    <>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Tìm kiếm tên, email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '0.6rem 1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
        />
        
        <select 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ padding: '0.6rem 1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
        >
          <option value="ALL">Tất cả chức danh</option>
          {Object.entries(roleLabel).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        
        <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.9rem' }}>
          Đang hiển thị {sortedUsers.length} kết quả
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>
                Tên {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </th>
              <th onClick={() => requestSort('email')} style={{ cursor: 'pointer', padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>
                Email {sortConfig?.key === 'email' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </th>
              <th onClick={() => requestSort('role')} style={{ cursor: 'pointer', padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>
                Vai trò {sortConfig?.key === 'role' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </th>
              <th onClick={() => requestSort('specialty')} style={{ cursor: 'pointer', padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>
                Chuyên khoa {sortConfig?.key === 'specialty' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </th>
              <th onClick={() => requestSort('createdAt')} style={{ cursor: 'pointer', padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>
                Ngày tạo {sortConfig?.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </th>
              <th style={{ padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.875rem 1rem', color: '#0f172a', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>{u.email}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: `${roleColor[u.role] || '#fff'}22`, color: roleColor[u.role] || '#fff' }}>
                    {roleLabel[u.role] || u.role}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#64748b' }}>{u.doctorInfo?.specialty || '—'}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#64748b' }}>
                  {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(u.createdAt))}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Link href={`/admin/users/${u.id}`} style={{ color: '#38bdf8', fontSize: '0.8rem', textDecoration: 'none' }}>Chi tiết</Link>
                </td>
              </tr>
            ))}
            {sortedUsers.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Không tìm thấy người dùng</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
