import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import Link from 'next/link';
import UserTableClient from './UserTableClient';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'DIRECTOR'].includes((session.user as any).role)) redirect('/login');

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { doctorInfo: true }
  });

  const roleColor: Record<string, string> = {
    ADMIN: '#f59e0b', DOCTOR: '#34d399', PATIENT: '#38bdf8',
    ACCOUNTANT: '#a855f7', CHIEF_ACCOUNTANT: '#8b5cf6',
    NURSE: '#ec4899', STAFF: '#64748b',
    DIRECTOR: '#ef4444', DEPUTY_DIRECTOR: '#f43f5e',
    HEAD_DOCTOR: '#10b981', DEPUTY_HEAD: '#059669'
  };
  const roleLabel: Record<string, string> = {
    ADMIN: 'Admin',
    DOCTOR: 'Bác sĩ',
    PATIENT: 'Bệnh nhân',
    ACCOUNTANT: 'Kế toán',
    CHIEF_ACCOUNTANT: 'Kế toán trưởng',
    NURSE: 'Điều dưỡng',
    STAFF: 'Nhân viên',
    DIRECTOR: 'Giám đốc',
    DEPUTY_DIRECTOR: 'Phó GĐ',
    HEAD_DOCTOR: 'Trưởng khoa/phòng',
    DEPUTY_HEAD: 'Phó khoa'
  };

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '8px', color: '#38bdf8', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>ADMIN</div>}>
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Quản lý người dùng</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>{users.length} tài khoản trong hệ thống</p>
          </div>
          <Link href="/admin/users/new" style={{ padding: '0.6rem 1.25rem', background: '#38bdf8', color: '#0f172a', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
            + Thêm người dùng
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {Object.entries(roleLabel).map(([role, label]) => {
            const count = users.filter(u => u.role === role).length;
            if (count === 0) return null;
            return (
              <div key={role} style={{ background: '#ffffff', border: `1px solid ${roleColor[role]}33`, borderRadius: '12px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: roleColor[role], fontWeight: 700, fontSize: '1.25rem' }}>{count}</span>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{label}</span>
              </div>
            );
          })}
        </div>

        <UserTableClient initialUsers={users} />
      </div>
    </DashboardShell>
  );
}
