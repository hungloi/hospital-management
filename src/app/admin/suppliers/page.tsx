import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';

// Import SuppliersClient as a client component
import SuppliersClient from './SuppliersClient';

export default async function AdminSuppliersPage() {
  // server side auth check
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/login');

  // Render a client component that fetches suppliers via SWR
  
  return (
    <DashboardShell title="Quản trị viên" subtitle="Nhà cung cấp" items={[]} theme={ADMIN_THEME} footer={null}>
      <div style={{ padding: '2rem' }}>
        <h1>🏷️ Nhà cung cấp</h1>
        <div style={{ marginTop: '1rem' }}>
          {/* Client component */}
          {/* @ts-ignore-next-line */}
          <SuppliersClient />
        </div>
      </div>
    </DashboardShell>
  );
}


