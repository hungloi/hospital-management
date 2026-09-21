import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';

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

export default async function DoctorInpatientPage() {
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role)) redirect('/login');

  const userId = (session.user as any).id;
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) redirect('/login');

  const inpatientRecords = await prisma.inpatientRecord.findMany({
    where: { doctorId: doctor.id, status: 'ADMITTED' },
    include: { patient: true },
    orderBy: { admissionDate: 'desc' }
  });

  return (
    <DashboardShell title={(session.user as any).name} subtitle="Bác sĩ" items={DOCTOR_NAV} theme={DOCTOR_THEME}>
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b' }}>🛏️ Quản lý Nội trú</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>{inpatientRecords.length} bệnh nhân đang nằm viện</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {inpatientRecords.length === 0 ? (
            <p style={{ color: '#64748b', padding: '1rem', background: 'white', borderRadius: '12px' }}>Không có bệnh nhân nội trú nào.</p>
          ) : (
            inpatientRecords.map(record => (
              <div key={record.id} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{record.patient.name}</h2>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Nhập viện: {new Intl.DateTimeFormat('vi-VN').format(new Date(record.admissionDate))}</p>
                  </div>
                  <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    ĐANG ĐIỀU TRỊ
                  </span>
                </div>
                
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ color: '#475569', fontSize: '0.85rem' }}><strong>Lý do:</strong> {record.reason}</p>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/doctor/inpatient/${record.id}`} style={{ flex: 1, textAlign: 'center', padding: '0.6rem', background: '#059669', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                    Chi tiết & Ra y lệnh
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

