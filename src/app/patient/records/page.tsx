import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { PATIENT_NAV, PATIENT_THEME } from '@/lib/adminConfig';




export default async function PatientRecordsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'PATIENT') redirect('/login');
  const userId = (session.user as any).id;

  const [regularRecords, clinicRecords] = await Promise.all([
    prisma.medicalRecord.findMany({
      where: { patientId: userId },
      include: {
        appointment: {
          include: { doctor: { include: { user: true, department: true } }, labOrders: true, prescription: { include: { items: { include: { medicine: true } } } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.clinicRecord.findMany({
      where: { patientId: userId },
      include: {
        clinicAppointment: {
          include: {
            doctor: { include: { user: true, department: true } },
            department: true,
            labOrders: true,
            prescription: { include: { items: { include: { medicine: true } } } },
          }
        }
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
      doctorName: record.appointment?.doctor?.user?.name || 'Bác sĩ chưa rõ',
      departmentName: record.appointment?.doctor?.department?.name || 'Chưa cập nhật',
      appointmentDate: record.appointment?.date,
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
      sourceId: record.clinicAppointmentId,
      doctorName: record.clinicAppointment?.doctor?.user?.name || 'Bác sĩ chưa rõ',
      departmentName: record.clinicAppointment?.department?.name || 'Chưa cập nhật',
      appointmentDate: record.clinicAppointment?.date,
      labOrders: record.clinicAppointment?.labOrders || [],
      prescriptionItems: record.clinicAppointment?.prescription?.items || [],
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardShell title={session.user.name!} subtitle="PATIENT" items={PATIENT_NAV} theme={PATIENT_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#dbeafe', borderRadius: '8px', color: '#2563eb', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>🧑 BỆNH NHÂN</div>}>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.5rem' }}>📁 Hồ sơ sức khỏe</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{records.length} lần khám</p>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', color: '#64748b' }}>
            <div style={{ fontSize: '3rem' }}>📁</div>
            <p style={{ marginTop: '0.75rem' }}>Chưa có hồ sơ bệnh án</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {records.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
               <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                   <div style={{ color: '#0f172a', fontWeight: 700 }}>{r.doctorName}</div>
                   <div style={{ color: '#bfdbfe', fontSize: '0.8rem' }}>{r.departmentName}</div>
                  </div>
                 <div style={{ color: '#bfdbfe', fontSize: '0.85rem', textAlign: 'right' }}>
                   <div style={{ fontWeight: 700, marginBottom: '2px' }}>{r.source}</div>
                   <div>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(r.createdAt))}</div>
                 </div>
               </div>
               <div style={{ padding: '1.25rem 1.5rem' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                   <div style={{ padding: '0.75rem', background: '#fef9c3', borderRadius: '10px' }}>
                     <div style={{ color: '#92400e', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>🔍 CHẨN ĐOÁN</div>
                     <div style={{ color: '#1e293b', fontSize: '0.9rem' }}>{r.diagnosis}</div>
                   </div>
                   <div style={{ padding: '0.75rem', background: '#ecfdf5', borderRadius: '10px' }}>
                     <div style={{ color: '#065f46', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>💊 ĐIỀU TRỊ</div>
                     <div style={{ color: '#1e293b', fontSize: '0.9rem' }}>{r.treatment}</div>
                   </div>
                 </div>
                 {r.labOrders.length > 0 && (
                   <div style={{ padding: '0.75rem', background: '#f0f9ff', borderRadius: '10px', marginBottom: '0.75rem' }}>
                     <div style={{ color: '#0369a1', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>🔬 CHỈ ĐỊNH XÉT NGHIỆM</div>
                     {r.labOrders.map((lo: any) => (
                       <div key={lo.id} style={{ color: '#334155', fontSize: '0.85rem', padding: '2px 0' }}>• {lo.type} — <span style={{ color: lo.status === 'DONE' ? '#16a34a' : '#f59e0b', fontWeight: 600 }}>{lo.status === 'DONE' ? 'Có kết quả' : 'Chờ kết quả'}</span></div>
                     ))}
                   </div>
                 )}
                 {r.prescriptionItems.length > 0 && (
                   <div style={{ padding: '0.75rem', background: '#fff7ed', borderRadius: '10px', marginBottom: '0.75rem' }}>
                     <div style={{ color: '#9a2c00', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>💊 ĐƠN THUỐC</div>
                     {r.prescriptionItems.map((item: any) => (
                       <div key={item.id} style={{ color: '#334155', fontSize: '0.85rem', padding: '2px 0' }}>• {item.medicine?.name || 'Thuốc'} — {item.dosage}</div>
                     ))}
                   </div>
                 )}
                 {r.notes && (
                   <div style={{ padding: '0.75rem', background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#475569', fontSize: '0.85rem' }}>
                     📝 {r.notes}
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



