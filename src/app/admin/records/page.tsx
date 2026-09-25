import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';


export default async function AdminRecordsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) redirect('/login');

  const [regularRecords, clinicRecords] = await Promise.all([
    prisma.medicalRecord.findMany({
      include: {
        patient: true,
        appointment: {
          include: {
            doctor: { include: { user: true, department: true } },
            labOrders: true,
            prescription: { include: { items: { include: { medicine: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.clinicRecord.findMany({
      include: {
        patient: true,
        clinicAppointment: {
          include: {
            doctor: { include: { user: true, department: true } },
            department: true,
            labOrders: true,
            prescription: { include: { items: { include: { medicine: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const records = [
    ...regularRecords.map((record) => ({
      id: record.id,
      createdAt: record.createdAt,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      notes: record.notes,
      source: 'NỘI TRÚ' as const,
      patientName: record.patient?.name || 'Bệnh nhân chưa rõ',
      doctorName: record.appointment?.doctor?.user?.name || 'Bác sĩ chưa rõ',
      departmentName: record.appointment?.doctor?.department?.name || 'Khoa chưa cập nhật',
      labOrders: record.appointment?.labOrders || [],
      prescriptionItems: record.appointment?.prescription?.items || [],
    })),
    ...clinicRecords.map((record) => ({
      id: record.id,
      createdAt: record.createdAt,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      notes: record.notes,
      source: 'NGOẠI TRÚ' as const,
      patientName: record.patient?.name || 'Bệnh nhân chưa rõ',
      doctorName: record.clinicAppointment?.doctor?.user?.name || 'Bác sĩ chưa rõ',
      departmentName: record.clinicAppointment?.department?.name || 'Khoa chưa cập nhật',
      labOrders: record.clinicAppointment?.labOrders || [],
      prescriptionItems: record.clinicAppointment?.prescription?.items || [],
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardShell
      title={session.user.name!}
      subtitle="Quản trị viên hệ thống"
      items={ADMIN_NAV}
      theme={ADMIN_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '8px', color: '#38bdf8', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>👑 ADMIN</div>}
    >
      <div style={{ padding: '2rem', color: '#0f172a', background: '#f8fafc' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>📁 Hồ sơ bệnh án</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{records.length} hồ sơ khám từ cả nội trú và ngoại trú</p>
        </div>

        {records.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Chưa có hồ sơ bệnh án nào được ghi nhận.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {records.map((record) => (
              <div key={record.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,0.06)' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{record.patientName}</div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{record.doctorName} • {record.departmentName}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: record.source === 'NGOẠI TRÚ' ? '#dbeafe' : '#dcfce7', color: record.source === 'NGOẠI TRÚ' ? '#1d4ed8' : '#15803d' }}>{record.source}</span>
                    <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(record.createdAt))}</span>
                  </div>
                </div>
                <div style={{ padding: '1rem 1.25rem', display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '10px', background: '#fef3c7', border: '1px solid #fef08a' }}>
                      <div style={{ color: '#b45309', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>🔍 CHẨN ĐOÁN</div>
                      <div style={{ color: '#0f172a' }}>{record.diagnosis}</div>
                    </div>
                    <div style={{ padding: '0.75rem', borderRadius: '10px', background: '#dcfce7', border: '1px solid #86efac' }}>
                      <div style={{ color: '#166534', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>💊 ĐIỀU TRỊ</div>
                      <div style={{ color: '#0f172a' }}>{record.treatment}</div>
                    </div>
                  </div>
                  {record.labOrders.length > 0 && (
                    <div style={{ padding: '0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px' }}>
                      <div style={{ color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>🔬 CHỈ ĐỊNH XÉT NGHIỆM</div>
                      {record.labOrders.map((labOrder: any) => (
                        <div key={labOrder.id} style={{ color: '#0f172a', fontSize: '0.85rem' }}>• {labOrder.type}</div>
                      ))}
                    </div>
                  )}
                  {record.prescriptionItems.length > 0 && (
                    <div style={{ padding: '0.75rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px' }}>
                      <div style={{ color: '#c2410c', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>💊 ĐƠN THUỐC</div>
                      {record.prescriptionItems.map((item: any) => (
                        <div key={item.id} style={{ color: '#0f172a', fontSize: '0.85rem' }}>• {item.medicine?.name || 'Thuốc'} — {item.dosage}</div>
                      ))}
                    </div>
                  )}
                  {record.notes && (
                    <div style={{ padding: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a' }}>
                      📝 {record.notes}
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
