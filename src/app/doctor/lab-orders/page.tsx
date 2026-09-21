import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { DOCTOR_NAV, DOCTOR_THEME } from '@/lib/adminConfig';



export default async function DoctorLabOrdersPage() {
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role)) redirect('/login');
  const userId = (session.user as any).id;
  const doctor = await prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
  if (!doctor) redirect('/login');

  const labOrders = await prisma.labOrder.findMany({
    where: { appointment: { doctorId: doctor.id } },
    include: { appointment: { include: { patient: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <DashboardShell title={doctor.user.name} subtitle={doctor.specialty} items={DOCTOR_NAV} theme={DOCTOR_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#d1fae5', borderRadius: '8px', color: '#059669', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>👨‍⚕️ BÁC SĨ</div>}>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.5rem' }}>🔬 Chỉ định xét nghiệm</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{labOrders.length} chỉ định</p>

        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f0fdf9' }}>
                {['Bệnh nhân', 'Loại xét nghiệm', 'Ngày chỉ định', 'Trạng thái', 'Kết quả'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', color: '#059669', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Chưa có chỉ định xét nghiệm</td></tr>
              ) : labOrders.map(lo => (
                <tr key={lo.id} style={{ borderTop: '1px solid #f0fdf9' }}>
                  <td style={{ padding: '0.875rem 1rem', color: '#0f172a', fontWeight: 600 }}>{lo.appointment?.patient?.name ?? '—'}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ background: '#ede9fe', color: '#5b21b6', padding: '2px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>🔬 {lo.type}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#64748b' }}>
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(lo.createdAt))}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: lo.status === 'DONE' ? '#dcfce7' : '#fef9c3', color: lo.status === 'DONE' ? '#16a34a' : '#ca8a04' }}>
                      {lo.status === 'DONE' ? '✓ Có kết quả' : '⏳ Chờ kết quả'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#475569', fontSize: '0.85rem' }}>
                    {lo.result || <span style={{ color: '#475569', fontStyle: 'italic' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

