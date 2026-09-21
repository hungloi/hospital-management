import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { PATIENT_NAV, PATIENT_THEME } from '@/lib/adminConfig';
import Link from 'next/link';




export default async function PatientAppointmentsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'PATIENT') redirect('/login');
  const userId = (session.user as any).id;

  const appointments = await prisma.appointment.findMany({
    where: { patientId: userId },
    include: { doctor: { include: { user: true, department: true } }, payments: true },
    orderBy: { date: 'desc' }
  });

  const STATUS_COLOR: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#2563eb', EXAMINING: '#7c3aed', COMPLETED: '#16a34a', CANCELLED: '#dc2626' };
  const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', EXAMINING: 'Đang khám', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };

  return (
    <DashboardShell title={session.user.name!} subtitle="PATIENT" items={PATIENT_NAV} theme={PATIENT_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#dbeafe', borderRadius: '8px', color: '#2563eb', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>🧑 BỆNH NHÂN</div>}>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e40af' }}>📋 Lịch hẹn của tôi</h1>
            <p style={{ color: '#64748b' }}>{appointments.length} lịch hẹn</p>
          </div>
          <Link href="/booking" style={{ padding: '0.6rem 1.25rem', background: '#2563eb', color: 'white', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>
            + Đặt lịch mới
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '3rem' }}>📭</div>
              <p style={{ color: '#64748b', marginTop: '0.75rem' }}>Bạn chưa có lịch hẹn nào</p>
              <Link href="/booking" style={{ color: '#2563eb', fontWeight: 600 }}>Đặt lịch ngay →</Link>
            </div>
          ) : appointments.map(a => (
            <div key={a.id} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: '#dbeafe', borderRadius: '12px', padding: '0.75rem', textAlign: 'center', minWidth: '70px' }}>
                <div style={{ color: '#2563eb', fontWeight: 800, fontSize: '1.25rem' }}>{new Date(a.date).getDate()}</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{new Intl.DateTimeFormat('vi-VN', { month: 'short', year: 'numeric' }).format(new Date(a.date))}</div>
                <div style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.75rem' }}>{new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(a.date))}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{a.doctor.user.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{a.doctor.department?.name || a.doctor.specialty}</div>
                {a.notes && <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '3px', fontStyle: 'italic' }}>"{a.notes}"</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: `${STATUS_COLOR[a.status]}18`, color: STATUS_COLOR[a.status] }}>
                  {STATUS_LABEL[a.status]}
                </span>
                {(a.payments && a.payments.some(p => p.status === 'PAID')) ? (
                  <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>✓ Đã thanh toán</span>
                ) : (a.status === 'CONFIRMED' || a.status === 'COMPLETED') ? (
                  <Link href={`/patient/pay/${a.id}`} style={{ padding: '4px 12px', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                    💳 Thanh toán
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}



