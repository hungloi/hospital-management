import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import BookingLink from '@/components/BookingLink';
import DashboardShell from '@/components/DashboardShell';
import { normalizeUserDisplayName } from '@/lib/userUtils';

import { PATIENT_NAV, PATIENT_THEME } from '@/lib/adminConfig';

export default async function PatientDashboard() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'PATIENT') redirect('/login');

  const userId = (session.user as any).id;

  const [upcoming, pastAppts, records, prescriptions] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: userId, status: { in: ['PENDING', 'CONFIRMED', 'EXAMINING'] } },
      include: { doctor: { include: { user: true, department: true } }, payments: true },
      orderBy: { date: 'asc' }, take: 5
    }),
    prisma.appointment.findMany({
      where: { patientId: userId, status: { in: ['COMPLETED', 'CANCELLED'] } },
      include: { doctor: { include: { user: true } }, payments: true },
      orderBy: { date: 'desc' }, take: 3
    }),
    prisma.medicalRecord.findMany({
      where: { patientId: userId },
      orderBy: { createdAt: 'desc' }, take: 3
    }),
    prisma.prescription.findMany({
      where: { appointment: { patientId: userId } },
      include: { items: { include: { medicine: true } }, appointment: { include: { doctor: { include: { user: true } } } } },
      orderBy: { createdAt: 'desc' }, take: 2
    }),
  ]);

  const STATUS_COLOR: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#2563eb', EXAMINING: '#7c3aed', COMPLETED: '#16a34a', CANCELLED: '#dc2626' };
  const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', EXAMINING: 'Đang khám', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };

  const displayName = normalizeUserDisplayName(session.user.name!);

  return (
    <DashboardShell
      title={displayName || session.user.name!}
      subtitle="Bệnh nhân"
      items={PATIENT_NAV}
      theme={PATIENT_THEME}
      footer={
        <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#dbeafe', borderRadius: '8px', color: '#2563eb', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>
          🧑 BỆNH NHÂN
        </div>
      }
    >
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e40af' }}>
            Xin chào, {displayName || session.user.name}! 👋
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Theo dõi sức khỏe và lịch khám của bạn</p>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <BookingLink href="/booking" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '14px', padding: '1.25rem', color: 'white', textDecoration: 'none' }}>
            <div style={{ fontSize: '1.75rem' }}>📅</div>
            <div style={{ fontWeight: 700, marginTop: '0.5rem', fontSize: '0.9rem' }}>Đặt lịch khám</div>
          </BookingLink>
          <Link href="/doctors" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: '14px', padding: '1.25rem', color: 'white', textDecoration: 'none' }}>
            <div style={{ fontSize: '1.75rem' }}>👨‍⚕️</div>
            <div style={{ fontWeight: 700, marginTop: '0.5rem', fontSize: '0.9rem' }}>Tìm bác sĩ</div>
          </Link>
          <Link href="/patient/prescriptions" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '14px', padding: '1.25rem', color: 'white', textDecoration: 'none' }}>
            <div style={{ fontSize: '1.75rem' }}>💊</div>
            <div style={{ fontWeight: 700, marginTop: '0.5rem', fontSize: '0.9rem' }}>Đơn thuốc</div>
          </Link>
          <Link href="/patient/records" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: '14px', padding: '1.25rem', color: 'white', textDecoration: 'none' }}>
            <div style={{ fontSize: '1.75rem' }}>📁</div>
            <div style={{ fontWeight: 700, marginTop: '0.5rem', fontSize: '0.9rem' }}>Hồ sơ</div>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
          {/* Upcoming appointments */}
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ color: '#1e40af', fontWeight: 700, fontSize: '1rem' }}>📅 Lịch hẹn sắp tới</h2>
                <Link href="/patient/appointments" style={{ color: '#2563eb', fontSize: '0.8rem', textDecoration: 'none' }}>Xem tất cả →</Link>
              </div>
              {upcoming.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#64748b' }}>
                  <div style={{ fontSize: '2rem' }}>📭</div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Chưa có lịch hẹn.</p>
                  <BookingLink href="/booking" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>Đặt lịch ngay</BookingLink>
                </div>
              ) : upcoming.map(a => (
                <div key={a.id} style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '0.625rem', alignItems: 'center' }}>
                  <div style={{ background: '#dbeafe', borderRadius: '10px', padding: '0.5rem', textAlign: 'center', minWidth: '52px' }}>
                    <div style={{ color: '#2563eb', fontWeight: 800, fontSize: '1.1rem' }}>
                      {new Date(a.date).getDate()}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                      {new Intl.DateTimeFormat('vi-VN', { month: 'short' }).format(new Date(a.date))}
                    </div>
                    <div style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 600 }}>
                      {new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(a.date))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{a.doctor.user.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{a.doctor.department?.name || a.doctor.specialty}</div>
                    {a.notes && <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>"{a.notes}"</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: `${STATUS_COLOR[a.status]}18`, color: STATUS_COLOR[a.status] }}>
                      {STATUS_LABEL[a.status]}
                    </span>
                    {a.status === 'CONFIRMED' && !(a.payments && a.payments.some(p => p.status === 'PAID')) && (
                      <Link href={`/patient/pay/${a.id}`} style={{ padding: '3px 10px', background: '#2563eb', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                        💳 Thanh toán
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Past appointments */}
            {pastAppts.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <h2 style={{ color: '#1e40af', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🕐 Lịch sử khám</h2>
                {pastAppts.map(a => (
                  <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{a.doctor.user.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(a.date))}
                        </div>
                      </div>
                      <span style={{ alignSelf: 'center', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: `${STATUS_COLOR[a.status]}18`, color: STATUS_COLOR[a.status] }}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                    {a.status === 'COMPLETED' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {/* Thanh toán sau khám */}
                        {!(a.payments && a.payments.some(p => p.status === 'PAID')) ? (
                          <Link href={`/patient/pay/${a.id}`} style={{ padding: '0.4rem 0.75rem', background: '#dc2626', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                            💳 Thanh toán chi phí
                          </Link>
                        ) : (
                          <Link href={`/print/receipt/${a.id}`} target="_blank" style={{ padding: '0.4rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                            🖨️ In phiếu thu
                          </Link>
                        )}
                        <Link href={`/print/prescription/${a.id}`} target="_blank" style={{ padding: '0.4rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                          🖨️ In đơn thuốc
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Recent medical records */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ color: '#1e40af', fontWeight: 700, fontSize: '1rem' }}>📁 Hồ sơ bệnh án</h2>
                <Link href="/patient/records" style={{ color: '#2563eb', fontSize: '0.8rem', textDecoration: 'none' }}>Xem tất cả →</Link>
              </div>
              {records.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>Chưa có hồ sơ</p>
              ) : records.map(r => (
                <div key={r.id} style={{ padding: '0.75rem', background: '#f0f9ff', borderRadius: '10px', marginBottom: '0.6rem', borderLeft: '3px solid #2563eb' }}>
                  <div style={{ color: '#1e40af', fontWeight: 600, fontSize: '0.85rem' }}>🔍 {r.diagnosis}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>💊 {r.treatment}</div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(r.createdAt))}
                  </div>
                </div>
              ))}
            </div>

            {/* Prescriptions */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ color: '#1e40af', fontWeight: 700, fontSize: '1rem' }}>💊 Đơn thuốc gần nhất</h2>
                <Link href="/patient/prescriptions" style={{ color: '#2563eb', fontSize: '0.8rem', textDecoration: 'none' }}>Xem tất cả →</Link>
              </div>
              {prescriptions.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>Chưa có đơn thuốc</p>
              ) : prescriptions.map(p => (
                <div key={p.id} style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: '10px', marginBottom: '0.6rem', borderLeft: '3px solid #16a34a' }}>
                  <div style={{ color: '#15803d', fontWeight: 600, fontSize: '0.8rem' }}>
                    BS. {p.appointment?.doctor?.user?.name ?? 'Bác sĩ chưa rõ'}
                  </div>
                  {p.items.map((item, i) => (
                    <div key={i} style={{ color: '#374151', fontSize: '0.78rem', marginTop: '3px' }}>
                      • {item.medicine.name} — {item.dosage}, {item.duration}
                    </div>
                  ))}
                  <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '4px' }}>
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(p.createdAt))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
