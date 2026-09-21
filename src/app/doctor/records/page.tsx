import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { DOCTOR_THEME } from '@/lib/adminConfig';

const DOCTOR_NAV = [
  { href: '/doctor', icon: '🏠', label: 'Tổng quan' },
  { href: '/doctor/schedule', icon: '📅', label: 'Lịch khám của tôi' },
  { href: '/doctor/patients', icon: '👥', label: 'Bệnh nhân của tôi' },
  { href: '/doctor/prescriptions', icon: '💊', label: 'Đơn thuốc đã kê' },
  { href: '/doctor/lab-orders', icon: '🔬', label: 'Chỉ định xét nghiệm' },
  { href: '/doctor/records', icon: '📁', label: 'Hồ sơ bệnh án' },
];
export default async function DoctorRecordsPage() {
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role)) redirect('/login');
  const userId = (session.user as any).id;
  const doctor = await prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
  if (!doctor) redirect('/login');

  const [regularRecords, clinicRecords] = await Promise.all([
    prisma.medicalRecord.findMany({
      where: { appointment: { doctorId: doctor.id } },
      include: {
        patient: true,
        appointment: { include: { labOrders: true, prescription: { include: { items: { include: { medicine: true } } } } } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.clinicRecord.findMany({
      where: { clinicAppointment: { doctorId: doctor.id } },
      include: {
        patient: true,
        clinicAppointment: { include: { labOrders: true, prescription: { include: { items: { include: { medicine: true } } } } } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const records = [
    ...regularRecords.map((record) => ({
      id: record.id,
      createdAt: record.createdAt,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      notes: record.notes,
      source: 'NỘI TRÚ' as const,
      sourceId: record.appointmentId,
      patientName: record.patient?.name || 'Bệnh nhân chưa rõ',
      labOrders: record.appointment?.labOrders || [],
      prescriptionItems: record.appointment?.prescription?.items || [],
      prescription: record.appointment?.prescription,
      appointmentId: record.appointmentId,
      patient: record.patient,
    })),
    ...clinicRecords.map((record) => ({
      id: record.id,
      createdAt: record.createdAt,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      notes: record.notes,
      source: 'NGOẠI TRÚ' as const,
      sourceId: record.clinicAppointmentId,
      patientName: record.patient?.name || 'Bệnh nhân chưa rõ',
      labOrders: record.clinicAppointment?.labOrders || [],
      prescriptionItems: record.clinicAppointment?.prescription?.items || [],
      prescription: record.clinicAppointment?.prescription,
      appointmentId: record.clinicAppointmentId,
      patient: record.patient,
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardShell title={doctor.user.name} subtitle={doctor.specialty} items={DOCTOR_NAV} theme={DOCTOR_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#d1fae5', borderRadius: '8px', color: '#059669', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>👨‍⚕️ BÁC SĨ</div>}>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.5rem' }}>📁 Hồ sơ bệnh án đã tạo</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{records.length} hồ sơ</p>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', color: '#64748b' }}>
            <p>Chưa có hồ sơ bệnh án nào</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {records.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: '14px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ background: '#f0fdf9', borderBottom: '1px solid #d1fae5', padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>
                      {r.patient.name.split(' ').at(-1)?.[0]}
                    </div>
                   <span style={{ fontWeight: 700, color: '#065f46' }}>{r.patientName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                      {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(r.createdAt))}
                    </span>
                    <span style={{ padding: '0.25rem 0.65rem', background: r.source === 'NGOẠI TRÚ' ? '#dbeafe' : '#dcfce7', color: r.source === 'NGOẠI TRÚ' ? '#1d4ed8' : '#15803d', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>{r.source}</span>
                    <a href={`/doctor/examine/${r.appointmentId}`} style={{ padding: '0.4rem 0.8rem', background: '#059669', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                      ✏️ Chỉnh sửa & In
                    </a>
                  </div>
                </div>
                <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div style={{ padding: '0.75rem', background: '#fefce8', borderRadius: '10px' }}>
                    <div style={{ color: '#92400e', fontWeight: 600, fontSize: '0.75rem', marginBottom: '4px' }}>🔍 CHẨN ĐOÁN</div>
                    <div style={{ color: '#1e293b' }}>{r.diagnosis}</div>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: '10px' }}>
                    <div style={{ color: '#065f46', fontWeight: 600, fontSize: '0.75rem', marginBottom: '4px' }}>💊 ĐIỀU TRỊ</div>
                    <div style={{ color: '#1e293b' }}>{r.treatment}</div>
                  </div>
                  {r.prescription && (
                    <div style={{ padding: '0.75rem', background: '#fff7ed', borderRadius: '10px' }}>
                      <div style={{ color: '#9a3412', fontWeight: 600, fontSize: '0.75rem', marginBottom: '4px' }}>💊 ĐƠN THUỐC</div>
                      {r.prescription.items.map((item: any) => (
                        <div key={item.id} style={{ color: '#374151', fontSize: '0.83rem' }}>• {item.medicine.name} - {item.dosage}</div>
                      ))}
                    </div>
                  )}
                  {r.labOrders.length > 0 && (
                    <div style={{ padding: '0.75rem', background: '#f0f9ff', borderRadius: '10px' }}>
                      <div style={{ color: '#0369a1', fontWeight: 600, fontSize: '0.75rem', marginBottom: '4px' }}>🔬 XÉT NGHIỆM</div>
                      {r.labOrders.map((lo: any) => (
                        <div key={lo.id} style={{ color: '#374151', fontSize: '0.83rem' }}>• {lo.type}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

