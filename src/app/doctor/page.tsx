import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import { DOCTOR_NAV, DOCTOR_THEME } from '@/lib/adminConfig';

export default async function DoctorDashboard() {
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role)) redirect('/login');

  const userId = (session.user as any).id;
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    include: { user: true, department: true }
  });
  if (!doctor) redirect('/login');

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);

  const [todayAppts, weekAppts, completedTotal, uniquePatients] = await Promise.all([
    prisma.appointment.findMany({
      where: { doctorId: doctor.id, date: { gte: today, lt: tomorrow } },
      include: { patient: true, prescription: true, labOrders: true },
      orderBy: { date: 'asc' }
    }),
    prisma.appointment.findMany({
      where: { doctorId: doctor.id, date: { gte: tomorrow, lt: weekEnd }, status: { in: ['PENDING', 'CONFIRMED'] } },
      include: { patient: true },
      orderBy: { date: 'asc' }
    }),
    prisma.appointment.count({ where: { doctorId: doctor.id, status: 'COMPLETED' } }),
    prisma.appointment.groupBy({ by: ['patientId'], where: { doctorId: doctor.id } }),
  ]);

  const STATUS_COLOR: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#0ea5e9', EXAMINING: '#8b5cf6', COMPLETED: '#10b981', CANCELLED: '#ef4444' };
  const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ', CONFIRMED: 'Xác nhận', EXAMINING: 'Đang khám', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };

  return (
    <DashboardShell
      title={doctor.user.name}
      subtitle={`${doctor.specialty} • ${doctor.department?.name || 'Chưa phân khoa'}`}
      items={DOCTOR_NAV}
      theme={DOCTOR_THEME}
      footer={
        <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#d1fae5', borderRadius: '8px', color: '#059669', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>
          👨‍⚕️ BÁC SĨ
        </div>
      }
    >
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b' }}>
              Chào, {doctor.user.name} 👨‍⚕️
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>
              {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(new Date())}
            </p>
          </div>
          <div style={{ background: '#059669', color: '#0f172a', padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
            🟢 Đang trực
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Khám hôm nay', value: todayAppts.length, icon: '📅', color: '#059669', bg: '#d1fae5' },
            { label: 'Lịch trong tuần', value: weekAppts.length, icon: '🗓️', color: '#0ea5e9', bg: '#e0f2fe' },
            { label: 'Đã hoàn thành', value: completedTotal, icon: '✅', color: '#7c3aed', bg: '#ede9fe' },
            { label: 'Bệnh nhân', value: uniquePatients.length, icon: '👥', color: '#f59e0b', bg: '#fef3c7' },
          ].map(c => (
            <div key={c.label} style={{ background: c.bg, borderRadius: '14px', padding: '1.25rem', border: `1px solid ${c.color}33` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{c.icon}</div>
              <div style={{ color: c.color, fontSize: '1.75rem', fontWeight: 800 }}>{c.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{c.label}</div>
            </div>
          ))}
        </div>

        {['HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role) && (
          <div style={{ background: '#fef3c7', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #fde68a' }}>
            <h2 style={{ color: '#b45309', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>👑 Quản lý Khoa ({doctor.department?.name})</h2>
            <p style={{ color: '#d97706', fontSize: '0.9rem' }}>Tính năng xem lịch khám và báo cáo hiệu suất của các bác sĩ trong khoa đang được cập nhật.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Today's appointments */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <h2 style={{ color: '#064e3b', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>📋 Lịch khám hôm nay</h2>
            {todayAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <div style={{ fontSize: '2.5rem' }}>🎉</div>
                <p style={{ marginTop: '0.5rem' }}>Hôm nay không có lịch khám</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {todayAppts.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ background: '#d1fae5', color: '#059669', borderRadius: '8px', padding: '0.4rem 0.6rem', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center', minWidth: '50px' }}>
                      {new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(a.date))}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{a.patient.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{a.notes || 'Không có ghi chú'}</div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: `${STATUS_COLOR[a.status]}22`, color: STATUS_COLOR[a.status] }}>
                      {STATUS_LABEL[a.status]}
                    </span>
                    {!['COMPLETED','CANCELLED'].includes(a.status) && (
                      <Link href={`/doctor/examine/${a.id}`} style={{
                        padding: '0.4rem 0.9rem', background: '#059669', color: 'white',
                        borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700
                      }}>
                        Khám ▶
                      </Link>
                    )}
                    {a.status === 'COMPLETED' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {a.prescription && <span style={{ fontSize: '0.75rem', color: '#059669' }}>💊</span>}
                        {a.labOrders.length > 0 && <span style={{ fontSize: '0.75rem', color: '#0ea5e9' }}>🔬</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming week */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <h2 style={{ color: '#064e3b', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>🗓️ Lịch trong tuần</h2>
            {weekAppts.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem', fontSize: '0.85rem' }}>Không có lịch hẹn</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {weekAppts.map(a => (
                  <div key={a.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.7rem', background: '#f0fdf9', borderRadius: '10px', border: '1px solid #d1fae5' }}>
                    <div style={{ textAlign: 'center', minWidth: '44px' }}>
                      <div style={{ color: '#059669', fontWeight: 700, fontSize: '1rem' }}>
                        {new Date(a.date).getDate()}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                        {new Intl.DateTimeFormat('vi-VN', { month: 'short' }).format(new Date(a.date))}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>{a.patient.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        {new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(a.date))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
