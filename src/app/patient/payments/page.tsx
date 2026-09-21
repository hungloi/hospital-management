import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { PATIENT_THEME } from '@/lib/adminConfig';

const PATIENT_NAV = [
  { href: '/patient', icon: '🏠', label: 'Trang chủ' },
  { href: '/booking', icon: '📅', label: 'Đặt lịch khám mới' },
  { href: '/patient/appointments', icon: '📋', label: 'Lịch hẹn của tôi' },
  { href: '/patient/records', icon: '📁', label: 'Hồ sơ sức khỏe' },
  { href: '/patient/prescriptions', icon: '💊', label: 'Đơn thuốc của tôi' },
  { href: '/patient/payments', icon: '💳', label: 'Lịch sử thanh toán' },
  { href: '/doctors', icon: '👨‍⚕️', label: 'Danh sách Bác sĩ' },
];
export default async function PatientPaymentsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'PATIENT') redirect('/login');
  const userId = (session.user as any).id;

  const payments = await prisma.payment.findMany({
    where: { appointment: { patientId: userId } },
    include: { appointment: { include: { doctor: { include: { user: true } } } } },
    orderBy: { createdAt: 'desc' }
  });

  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);

  const STATUS_COLOR: Record<string, string> = { PAID: '#16a34a', PENDING: '#d97706', FAILED: '#dc2626', REFUNDED: '#7c3aed' };
  const STATUS_LABEL: Record<string, string> = { PAID: '✓ Đã thanh toán', PENDING: '⏳ Chờ TT', FAILED: '✗ Thất bại', REFUNDED: '↩ Hoàn tiền' };
  const METHOD_LABEL: Record<string, string> = { VNPAY: '🏦 VNPay', CASH: '💵 Tiền mặt', CARD: '💳 Thẻ', TRANSFER: '📲 Chuyển khoản' };

  return (
    <DashboardShell title={session.user.name!} subtitle="PATIENT" items={PATIENT_NAV} theme={PATIENT_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#dbeafe', borderRadius: '8px', color: '#2563eb', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>🧑 BỆNH NHÂN</div>}>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.5rem' }}>💳 Lịch sử thanh toán</h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{payments.length} giao dịch</p>

        {/* Summary */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#dcfce7', borderRadius: '14px', padding: '1rem 1.5rem', border: '1px solid #86efac', flex: 1 }}>
            <div style={{ color: '#166534', fontSize: '0.8rem', fontWeight: 600 }}>Tổng đã thanh toán</div>
            <div style={{ color: '#15803d', fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>{totalPaid.toLocaleString('vi-VN')}₫</div>
          </div>
          <div style={{ background: '#dbeafe', borderRadius: '14px', padding: '1rem 1.5rem', border: '1px solid #93c5fd', flex: 1 }}>
            <div style={{ color: '#1e40af', fontSize: '0.8rem', fontWeight: 600 }}>Tổng giao dịch</div>
            <div style={{ color: '#2563eb', fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>{payments.length}</div>
          </div>
        </div>

        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem' }}>💳</div>
            <p style={{ marginTop: '0.75rem' }}>Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {payments.map(p => (
              <div key={p.id} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ background: p.status === 'PAID' ? '#dcfce7' : '#fef3c7', borderRadius: '10px', padding: '0.75rem', fontSize: '1.5rem' }}>
                  {p.status === 'PAID' ? '✅' : '⏳'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.appointment?.doctor?.user?.name ?? '—'}</div>
                  <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '2px' }}>
                    {METHOD_LABEL[p.method] || p.method || '—'} •{' '}
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(p.createdAt))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: STATUS_COLOR[p.status] || '#64748b', fontWeight: 800, fontSize: '1.1rem' }}>
                    {p.amount.toLocaleString('vi-VN')}₫
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: `${STATUS_COLOR[p.status] || '#64748b'}18`, color: STATUS_COLOR[p.status] || '#64748b' }}>
                    {STATUS_LABEL[p.status] || p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}


