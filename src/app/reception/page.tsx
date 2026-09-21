import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { RECEPTION_THEME } from '@/lib/adminConfig';
import ReceptionClient from './ReceptionClient';

const RECEPTION_NAV = [
  { href: '/reception', icon: '💁‍♀️', label: 'Tiếp đón Bệnh nhân' },
];

const FOOTER = <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#fae8ff', borderRadius: '8px', color: '#c026d3', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>💁‍♀️ QUẦY TIẾP ĐÓN</div>;

export default async function ReceptionPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'RECEPTIONIST') redirect('/login');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: today },
    },
    include: {
      patient: true,
      doctor: { include: { user: true, department: true } }
    },
    orderBy: [
      { status: 'asc' }, // PENDING first ideally, but 'PENDING' vs 'CONFIRMED' -> P is later than C. Let's sort by date in Client.
      { date: 'asc' }
    ]
  });

  return (
    <DashboardShell title="Bộ phận Lễ tân" subtitle="Đón tiếp" items={RECEPTION_NAV} theme={RECEPTION_THEME} >
      <ReceptionClient appointments={appointments} />
    </DashboardShell>
  );
}

