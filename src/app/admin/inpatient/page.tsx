import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV } from '@/lib/adminConfig';
import { InpatientClient } from './InpatientClient';

export default async function AdminInpatientPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <DashboardShell
      title={session.user.name || 'ADMIN'}
      subtitle="Quản lý nội trú và xuất viện"
      items={ADMIN_NAV}
      theme={{
        bg: '#0f172a',
        sidebar: '#0a1628',
        border: '#334155',
        activeText: '#38bdf8',
        activeBg: 'rgba(56,189,248,0.14)',
        textMuted: '#94a3b8',
        text: '#f8fafc',
      }}
    >
      <InpatientClient />
    </DashboardShell>
  );
}

