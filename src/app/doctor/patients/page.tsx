import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { DOCTOR_THEME } from '@/lib/adminConfig';
import Link from 'next/link';

const DOCTOR_NAV = [
  { href: '/doctor', icon: '🏠', label: 'Tổng quan' },
  { href: '/doctor/schedule', icon: '📅', label: 'Lịch khám của tôi' },
  { href: '/doctor/patients', icon: '👥', label: 'Bệnh nhân của tôi' },
  { href: '/doctor/prescriptions', icon: '💊', label: 'Đơn thuốc đã kê' },
  { href: '/doctor/lab-orders', icon: '🔬', label: 'Chỉ định xét nghiệm' },
  { href: '/doctor/records', icon: '📁', label: 'Hồ sơ bệnh án' },
];
export default async function DoctorPatientsPage() {
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role)) redirect('/login');
  const userId = (session.user as any).id;
  const doctor = await prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
  if (!doctor) redirect('/login');

  // Unique patients with their latest appointment
  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctor.id },
    include: { patient: true, medicalRecord: true, prescription: true },
    orderBy: { date: 'desc' }
  });

  // Group by patient
  const patientMap = new Map<string, typeof appointments[0][]>();
  appointments.forEach(a => {
    if (!patientMap.has(a.patientId)) patientMap.set(a.patientId, []);
    patientMap.get(a.patientId)!.push(a);
  });

  const patients = Array.from(patientMap.values()).map(appts => ({
    patient: appts[0].patient,
    latestAppt: appts[0],
    totalVisits: appts.length,
    hasRecord: appts.some(a => a.medicalRecord),
    hasPrescription: appts.some(a => a.prescription),
  }));

  return (
    <DashboardShell title={doctor.user.name} subtitle={doctor.specialty} items={DOCTOR_NAV} theme={DOCTOR_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#d1fae5', borderRadius: '8px', color: '#059669', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>👨‍⚕️ BÁC SĨ</div>}>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.5rem' }}>👥 Bệnh nhân của tôi</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{patients.length} bệnh nhân đã từng khám</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {patients.length === 0 ? (
            <p style={{ color: '#64748b' }}>Chưa có bệnh nhân nào</p>
          ) : patients.map(({ patient, latestAppt, totalVisits, hasRecord, hasPrescription }) => (
            <div key={patient.id} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 700, fontSize: '1rem' }}>
                  {patient.name.split(' ').at(-1)?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{patient.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{patient.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <span style={{ background: '#d1fae5', color: '#059669', padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                  {totalVisits} lần khám
                </span>
                {hasRecord && <span title="Có hồ sơ bệnh án" style={{ background: '#dbeafe', color: '#2563eb', padding: '2px 8px', borderRadius: '20px', fontSize: '0.78rem' }}>📁 Hồ sơ</span>}
                {hasPrescription && <span title="Đã kê đơn" style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '20px', fontSize: '0.78rem' }}>💊 Đơn thuốc</span>}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                Lần khám gần nhất: {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(latestAppt.date))}
              </div>
              {!['COMPLETED','CANCELLED'].includes(latestAppt.status) && (
                <Link href={`/doctor/examine/${latestAppt.id}`} style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', padding: '0.5rem', background: '#059669', color: 'white', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                  Tiếp tục khám ▶
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

