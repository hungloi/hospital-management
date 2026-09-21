import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import ClinicClient from './ClinicClient';

export const metadata: Metadata = {
  title: 'Phòng khám - Bệnh viện',
  description: 'Quản lý lịch hẹn và hoạt động phòng khám ngoại trú',
};

export default async function ClinicPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/login');

  return (
    <DashboardShell title={session.user.name || 'ADMIN'} subtitle="Phòng khám" items={ADMIN_NAV} theme={ADMIN_THEME}>
      <div style={{ padding: '2rem' }}>
        <ClinicClient />
      </div>
    </DashboardShell>
  );
}
