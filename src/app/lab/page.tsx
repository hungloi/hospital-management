import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { LAB_THEME } from '@/lib/adminConfig';
import LabClient from './LabClient';

const LAB_NAV = [
  { href: '/lab', icon: '🔬', label: 'Trả kết quả Cận Lâm Sàng' },
];

const FOOTER = <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#e0f2fe', borderRadius: '8px', color: '#0284c7', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>🔬 KHOA CẬN LÂM SÀNG</div>;

export default async function LabPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'LAB_TECH') redirect('/login');

  const pendingOrders = await prisma.labOrder.findMany({
    where: { status: 'PENDING' },
    include: {
      appointment: { include: { patient: true, doctor: { include: { user: true } } } }
    },
    orderBy: { createdAt: 'asc' }
  });

  const recentOrders = await prisma.labOrder.findMany({
    where: { status: 'DONE' },
    include: {
      appointment: { include: { patient: true, doctor: { include: { user: true } } } }
    },
    orderBy: { updatedAt: 'desc' },
    take: 10
  });

  return (
    <DashboardShell title="Kỹ thuật viên" subtitle="Cận lâm sàng" items={LAB_NAV} theme={LAB_THEME} >
      <LabClient pendingOrders={pendingOrders} recentOrders={recentOrders} />
    </DashboardShell>
  );
}

