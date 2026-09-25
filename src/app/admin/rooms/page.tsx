import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import RoomsClient from './RoomsClient';

export default async function AdminRoomsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) redirect('/login');

  return (
    <DashboardShell title={session.user.name || 'ADMIN'} subtitle="Quản lý phòng bệnh" items={ADMIN_NAV} theme={ADMIN_THEME}>
      <div style={{ padding: '2rem' }}>
        <RoomsClient />
      </div>
    </DashboardShell>
  );
}
