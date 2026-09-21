'use client';
import { useState, useMemo } from 'react';

type DoctorData = {
  id: string;
  specialty: string;
  bio: string | null;
  user: { name: string; email: string };
  department: { name: string } | null;
  _count: { appointments: number };
};

export default function DoctorTableClient({ initialDoctors, departments }: { initialDoctors: DoctorData[], departments: string[] }) {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedDoctors = useMemo(() => {
    let sortableItems = [...initialDoctors];
    
    // Filter by department
    if (filterDepartment !== 'ALL') {
      sortableItems = sortableItems.filter(d => (d.department?.name || 'Chưa phân khoa') === filterDepartment);
    }
    // Search by name or email
    if (searchQuery) {
      sortableItems = sortableItems.filter(d => 
        d.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof DoctorData];
        let bValue: any = b[sortConfig.key as keyof DoctorData];

        if (sortConfig.key === 'name') {
          aValue = a.user.name;
          bValue = b.user.name;
        } else if (sortConfig.key === 'email') {
          aValue = a.user.email;
          bValue = b.user.email;
        } else if (sortConfig.key === 'department') {
          aValue = a.department?.name || '';
          bValue = b.department?.name || '';
        } else if (sortConfig.key === 'appointments') {
          aValue = a._count.appointments;
          bValue = b._count.appointments;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [initialDoctors, sortConfig, filterDepartment, searchQuery]);

  return (
    <>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Tìm kiếm tên, email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '0.6rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
        />
        
        <select 
          value={filterDepartment} 
          onChange={(e) => setFilterDepartment(e.target.value)}
          style={{ padding: '0.6rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
        >
          <option value="ALL">Tất cả khoa</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
          <option value="Chưa phân khoa">Chưa phân khoa</option>
        </select>
        
        <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.9rem' }}>
          Đang hiển thị {sortedDoctors.length} bác sĩ
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#ffffff' }}>
              <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>
                Bác sĩ {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </th>
              <th onClick={() => requestSort('email')} style={{ cursor: 'pointer', padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>
                Email {sortConfig?.key === 'email' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </th>
              <th onClick={() => requestSort('specialty')} style={{ cursor: 'pointer', padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>
                Chuyên khoa {sortConfig?.key === 'specialty' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </th>
              <th onClick={() => requestSort('department')} style={{ cursor: 'pointer', padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>
                Khoa {sortConfig?.key === 'department' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </th>
              <th onClick={() => requestSort('appointments')} style={{ cursor: 'pointer', padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>
                Số lịch hẹn {sortConfig?.key === 'appointments' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
              </th>
              <th style={{ padding: '0.875rem 1rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>Bio</th>
            </tr>
          </thead>
          <tbody>
            {sortedDoctors.map(doc => (
              <tr key={doc.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                      {doc.user.name.split(' ').at(-1)?.[0]}
                    </div>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{doc.user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#64748b' }}>{doc.user.email}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '2px 10px', borderRadius: '6px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{doc.specialty}</span>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#64748b' }}>{doc.department?.name || '—'}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#34d399', fontWeight: 700 }}>{doc._count.appointments}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.8rem', maxWidth: '200px' }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {doc.bio || '—'}
                  </span>
                </td>
              </tr>
            ))}
            {sortedDoctors.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Không tìm thấy bác sĩ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
