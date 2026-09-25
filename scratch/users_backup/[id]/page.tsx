import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import UserDetailClient from './UserDetailClient';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';


export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) redirect('/login');

  const { id } = await params;
  
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      doctorInfo: {
        include: { department: true }
      }
    }
  });

  if (!user) notFound();

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME}>
      <div style={{ padding: '2rem', color: '#0f172a', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/admin/users" style={{ color: '#64748b', textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Hồ sơ nhân sự</h1>
        </div>

        <UserDetailClient user={user} />

      </div>
    </DashboardShell>
  );
}
