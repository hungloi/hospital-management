import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import Link from 'next/link';
import NewDoctorForm from './NewDoctorForm';




export default async function NewDoctorPage() {
  const users = await prisma.user.findMany({
    where: { role: 'DOCTOR', doctorInfo: null },
    orderBy: { name: 'asc' }
  });

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME}>
      <div style={{ padding: '2rem', color: '#0f172a', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/admin/doctors" style={{ color: '#64748b', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Thêm hồ sơ Bác sĩ</h1>
        </div>

        <NewDoctorForm users={users} departments={departments} />
      </div>
    </DashboardShell>
  );
}


