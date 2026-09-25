import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import PatientsClient from './PatientsClient';

export default async function AdminPatientsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) redirect('/login');

  return (
    <DashboardShell title={session.user.name || 'ADMIN'} subtitle="Quản lý bệnh nhân" items={ADMIN_NAV} theme={ADMIN_THEME}>
      <div style={{ padding: '2rem' }}>
        <PatientsClient />
      </div>
    </DashboardShell>
  );
}
