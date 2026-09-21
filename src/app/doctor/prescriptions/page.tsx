import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { DOCTOR_NAV, DOCTOR_THEME } from '@/lib/adminConfig';
import Link from 'next/link';



export default async function DoctorPrescriptionsPage() {
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role)) redirect('/login');
  const userId = (session.user as any).id;
  const doctor = await prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
  if (!doctor) redirect('/login');

  const prescriptions = await prisma.prescription.findMany({
    where: { appointment: { doctorId: doctor.id } },
    include: {
      items: { include: { medicine: true } },
      appointment: { include: { patient: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <DashboardShell title={doctor.user.name} subtitle={doctor.specialty} items={DOCTOR_NAV} theme={DOCTOR_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#d1fae5', borderRadius: '8px', color: '#059669', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>👨‍⚕️ BÁC SĨ</div>}>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.5rem' }}>💊 Đơn thuốc đã kê</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{prescriptions.length} đơn đã kê</p>

        {prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', color: '#64748b' }}>
            <p>Chưa có đơn thuốc nào được kê</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {prescriptions.map(p => (
              <div key={p.id} style={{ background: 'white', borderRadius: '14px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ background: '#f0fdf9', borderBottom: '1px solid #d1fae5', padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#065f46', fontWeight: 700 }}>👤 {p.appointment?.patient?.name ?? 'Bệnh nhân chưa rõ'}</span>
                    <span style={{ color: '#64748b', marginLeft: '1rem', fontSize: '0.85rem' }}>
                      {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(p.createdAt))}
                    </span>
                  </div>
                  <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>{p.items.length} loại thuốc</span>
                </div>
                <div style={{ padding: '0.875rem 1.25rem' }}>
                  {p.items.map((item, i) => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '0.4rem 0', borderBottom: i < p.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <span style={{ color: '#059669', minWidth: '24px', fontWeight: 700 }}>{i + 1}.</span>
                      <span style={{ color: '#0f172a', fontWeight: 600, minWidth: '180px' }}>{item.medicine.name}</span>
                      <span style={{ color: '#475569' }}>{item.dosage}</span>
                      <span style={{ color: '#64748b' }}>• {item.duration}</span>
                      {item.instructions && <span style={{ color: '#64748b', fontStyle: 'italic' }}>({item.instructions})</span>}
                    </div>
                  ))}
                  {p.notes && <div style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>📝 {p.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

