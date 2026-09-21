import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import InpatientDetailClient from '@/app/doctor/inpatient/[recordId]/InpatientDetailClient';

const DOCTOR_NAV = [
  { href: '/doctor', icon: '🏠', label: 'Tổng quan' },
  { href: '/doctor/schedule', icon: '📅', label: 'Lịch khám của tôi' },
  { href: '/doctor/patients', icon: '👥', label: 'Bệnh nhân của tôi' },
  { href: '/doctor/inpatient', icon: '🛏️', label: 'Quản lý Nội trú' },
  { href: '/doctor/prescriptions', icon: '💊', label: 'Đơn thuốc đã kê' },
  { href: '/doctor/lab-orders', icon: '🔬', label: 'Chỉ định xét nghiệm' },
];

const DOCTOR_THEME = {
  bg: '#f0fdf9',
  sidebar: '#0a1628',
  border: '#d1fae5',
  activeText: '#059669',
  activeBg: '#d1fae5',
  textMuted: '#64748b',
  text: '#065f46',
};

export default async function InpatientDetail({ params }: { params: Promise<{ recordId: string }> }) {
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role)) redirect('/login');

  const { recordId } = await params;

  const record = await prisma.inpatientRecord.findUnique({
    where: { id: recordId },
    include: { patient: true, medicalOrders: { orderBy: { createdAt: 'desc' } } }
  });

  if (!record) notFound();

  const doctorId = await prisma.doctor.findUnique({ where: { userId: (session.user as any).id } }).then(d => d?.id);

  return (
    <DashboardShell title={(session.user as any).name} subtitle="Bác sĩ" items={DOCTOR_NAV} theme={DOCTOR_THEME}>
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/doctor/inpatient" style={{ color: '#059669', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>← Quay lại danh sách</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginTop: '0.5rem' }}>
            Hồ sơ nội trú: {record.patient.name}
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Lý do nhập viện: {record.reason}
          </p>
        </div>

        <InpatientDetailClient record={record} doctorId={doctorId!} />
      </div>
    </DashboardShell>
  );
}
