import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { DIRECTOR_THEME } from '@/lib/adminConfig';
import { prisma } from '@/lib/prisma';
import { DIRECTOR_NAV } from '../page';
import ApprovalsClient from './ApprovalsClient';

export default async function DirectorApprovalsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['ADMIN', 'DIRECTOR', 'DEPUTY_DIRECTOR'].includes(role)) {
    redirect('/login');
  }

  // Fetch pending surgery orders
  const pendingSurgeriesRaw = await prisma.surgeryOrder.findMany({
    where: { status: 'PENDING' },
    include: {
      patient: true,
      doctor: { include: { user: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch pending medical orders
  const pendingMedicalsRaw = await prisma.medicalOrder.findMany({
    where: { status: 'PENDING' },
    include: {
      doctor: { include: { user: true } },
      inpatientRecord: { include: { patient: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Map to common format
  const pendingSurgeries = pendingSurgeriesRaw.map(s => ({
    id: s.id,
    type: 'SURGERY' as const,
    title: `Lệnh Phẫu thuật: ${s.surgeryName}`,
    description: `Chẩn đoán: ${s.diagnosisBefore}`,
    patientName: s.patient?.name || 'Bệnh nhân',
    doctorName: s.doctor?.user?.name || 'Bác sĩ',
    date: new Date(s.createdAt).toLocaleDateString('vi-VN'),
    status: s.status
  }));

  const pendingMedicals = pendingMedicalsRaw.map(m => ({
    id: m.id,
    type: 'MEDICAL' as const,
    title: 'Y lệnh Nội trú đặc biệt',
    description: m.orderText,
    patientName: m.inpatientRecord?.patient?.name || 'Bệnh nhân',
    doctorName: m.doctor?.user?.name || 'Bác sĩ',
    date: new Date(m.createdAt).toLocaleDateString('vi-VN'),
    status: m.status
  }));

  return (
    <DashboardShell title="Ban Giám Đốc" subtitle="Ký duyệt Y lệnh" items={DIRECTOR_NAV} theme={DIRECTOR_THEME} >
      <ApprovalsClient pendingSurgeries={pendingSurgeries} pendingMedicals={pendingMedicals} />
    </DashboardShell>
  );
}
