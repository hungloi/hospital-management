import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import Link from 'next/link';

import DoctorTableClient from './DoctorTableClient';


export default async function AdminDoctorsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) redirect('/login');

  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      department: true,
      _count: { select: { appointments: true } }
    },
    orderBy: { user: { name: 'asc' } }
  });

  const allDepts = await prisma.department.findMany({
    select: { name: true },
    orderBy: { name: 'asc' }
  });
  const departments = allDepts.map(d => d.name);

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME} >
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>👨‍⚕️ Quản lý Bác sĩ</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>{doctors.length} bác sĩ trong hệ thống</p>
          </div>
          <Link href="/admin/doctors/new" style={{ padding: '0.6rem 1.25rem', background: '#38bdf8', color: '#0f172a', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
            + Thêm Bác sĩ
          </Link>
        </div>

        <DoctorTableClient initialDoctors={doctors} departments={departments} />
      </div>
    </DashboardShell>
  );
}



