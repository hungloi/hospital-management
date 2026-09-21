import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { PATIENT_NAV, PATIENT_THEME } from '@/lib/adminConfig';




export default async function PatientPrescriptionsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'PATIENT') redirect('/login');
  const userId = (session.user as any).id;

  const prescriptions = await prisma.prescription.findMany({
    where: { appointment: { patientId: userId } },
    include: {
      items: { include: { medicine: true } },
      appointment: { include: { doctor: { include: { user: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <DashboardShell title={session.user.name!} subtitle="PATIENT" items={PATIENT_NAV} theme={PATIENT_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#dbeafe', borderRadius: '8px', color: '#2563eb', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>🧑 BỆNH NHÂN</div>}>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.5rem' }}>💊 Đơn thuốc của tôi</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{prescriptions.length} đơn thuốc</p>

        {prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', color: '#64748b' }}>
            <div style={{ fontSize: '3rem' }}>💊</div>
            <p style={{ marginTop: '0.75rem' }}>Bạn chưa có đơn thuốc nào</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {prescriptions.map(p => (
              <div key={p.id} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem' }}>
                      Đơn thuốc — {p.appointment?.doctor?.user?.name ?? 'Bác sĩ chưa rõ'}
                    </div>
                    <div style={{ color: '#15803d', fontSize: '0.8rem' }}>
                      {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(p.createdAt))}
                    </div>
                  </div>
                  <span style={{ background: 'rgba(255,255,255,0.2)', color: '#0f172a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>
                    {p.items.length} loại thuốc
                  </span>
                </div>
                {/* Medicine list */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                        {['STT', 'Tên thuốc', 'Liều dùng', 'Số ngày', 'Cách dùng'].map(h => (
                          <th key={h} style={{ padding: '0.5rem 0.75rem', color: '#64748b', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {p.items.map((item, i) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{i + 1}</td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#0f172a', fontWeight: 600 }}>{item.medicine.name}</td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#374151' }}>{item.dosage}</td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#374151' }}>{item.duration}</td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>{item.instructions || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {p.notes && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fefce8', border: '1px solid #fde047', borderRadius: '10px', color: '#713f12', fontSize: '0.85rem' }}>
                      📝 <strong>Lời dặn:</strong> {p.notes}
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



