import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import NursesClient from './NursesClient';

export const metadata: Metadata = {
  title: 'Quản lý y tá - Bệnh viện',
  description: 'Quản lý y tá điều dưỡng và phân bổ theo khoa',
};

export default async function NursesPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/login');

  return (
    <DashboardShell title={session.user.name || 'ADMIN'} subtitle="Quản lý Y tá" items={ADMIN_NAV} theme={ADMIN_THEME}>
      <div style={{ padding: '2rem' }}>
        <NursesClient />
      </div>
    </DashboardShell>
  );
}
