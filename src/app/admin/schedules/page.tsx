import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import SchedulesClient from './SchedulesClient';

export const metadata: Metadata = {
  title: 'Ca làm việc - Bệnh viện',
  description: 'Phân công ca làm việc cho bác sĩ và y tá theo khoa',
};

export default async function SchedulesPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) redirect('/login');

  return (
    <DashboardShell title={session.user.name || 'ADMIN'} subtitle="Ca làm việc" items={ADMIN_NAV} theme={ADMIN_THEME}>
      <div style={{ padding: '2rem' }}>
        <SchedulesClient />
      </div>
    </DashboardShell>
  );
}
