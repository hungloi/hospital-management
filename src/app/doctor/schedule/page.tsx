import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { DOCTOR_NAV, DOCTOR_THEME } from '@/lib/adminConfig';



export default async function DoctorSchedulePage() {
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role)) redirect('/login');
  const userId = (session.user as any).id;
  const doctor = await prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
  if (!doctor) redirect('/login');

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctor.id, status: { not: 'CANCELLED' } },
    include: { patient: true, prescription: true, labOrders: true },
    orderBy: { date: 'asc' }
  });

  const grouped: Record<string, typeof appointments> = {};
  appointments.forEach(a => {
    const key = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(new Date(a.date));
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  });

  const STATUS_COLOR: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#0ea5e9', EXAMINING: '#8b5cf6', COMPLETED: '#10b981' };
  const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ', CONFIRMED: 'Xác nhận', EXAMINING: 'Đang khám', COMPLETED: 'Hoàn thành' };

  return (
    <DashboardShell title={doctor.user.name} subtitle={doctor.specialty} items={DOCTOR_NAV} theme={DOCTOR_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#d1fae5', borderRadius: '8px', color: '#059669', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>👨‍⚕️ BÁC SĨ</div>}>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.5rem' }}>📅 Lịch khám của tôi</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{appointments.length} lịch hẹn sắp tới</p>

        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', color: '#64748b' }}>
            <div style={{ fontSize: '3rem' }}>📅</div>
            <p style={{ marginTop: '0.75rem' }}>Không có lịch hẹn nào</p>
          </div>
        ) : Object.entries(grouped).map(([date, appts]) => (
          <div key={date} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ height: '1px', flex: 0.05, background: '#d1fae5' }} />
              <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>📆 {date}</span>
              <div style={{ height: '1px', flex: 1, background: '#d1fae5' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {appts.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <div style={{ background: '#d1fae5', color: '#059669', borderRadius: '8px', padding: '0.4rem 0.6rem', fontWeight: 700, fontSize: '0.85rem', minWidth: '55px', textAlign: 'center' }}>
                    {new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(a.date))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{a.patient.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{a.notes || 'Không có ghi chú'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {a.prescription && <span title="Đã kê đơn">💊</span>}
                    {a.labOrders.length > 0 && <span title="Có chỉ định XN">🔬</span>}
                    <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: `${STATUS_COLOR[a.status]}22`, color: STATUS_COLOR[a.status] }}>
                      {STATUS_LABEL[a.status]}
                    </span>
                    {!['COMPLETED', 'CANCELLED'].includes(a.status) && (
                      <a href={`/doctor/examine/${a.id}`} style={{ padding: '4px 12px', background: '#059669', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
                        Khám ▶
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

