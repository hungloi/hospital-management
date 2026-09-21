import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';


export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/login');

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { appointment: { include: { patient: true, doctor: { include: { user: true } } } } }
  });

  const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

  const STATUS_COLOR: Record<string, string> = { PAID: '#16a34a', PENDING: '#d97706', FAILED: '#dc2626', REFUNDED: '#7c3aed' };
  const STATUS_BG: Record<string, string> = { PAID: '#dcfce7', PENDING: '#fef3c7', FAILED: '#fee2e2', REFUNDED: '#ede9fe' };
  const STATUS_LABEL: Record<string, string> = { PAID: '✓ Đã thanh toán', PENDING: '⏳ Chờ TT', FAILED: '✗ Thất bại', REFUNDED: '↩ Hoàn tiền' };

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME} >
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>💰 Quản lý thanh toán</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>{payments.length} giao dịch</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', borderTop: '3px solid #16a34a', boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0, fontWeight: 500 }}>Tổng đã thu</p>
                <p style={{ color: '#16a34a', fontSize: '2rem', fontWeight: 900, margin: '0.35rem 0 0', lineHeight: 1 }}>
                  {(totalRevenue / 1_000_000).toFixed(1)}M₫
                </p>
                <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem' }}>{payments.filter(p => p.status === 'PAID').length} giao dịch</p>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💰</div>
            </div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', borderTop: '3px solid #d97706', boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0, fontWeight: 500 }}>Chờ thanh toán</p>
                <p style={{ color: '#d97706', fontSize: '2rem', fontWeight: 900, margin: '0.35rem 0 0', lineHeight: 1 }}>
                  {(totalPending / 1_000_000).toFixed(1)}M₫
                </p>
                <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem' }}>{payments.filter(p => p.status === 'PENDING').length} giao dịch</p>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⏳</div>
            </div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', borderTop: '3px solid #60a5fa', boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0, fontWeight: 500 }}>Tổng giao dịch</p>
                <p style={{ color: '#2563eb', fontSize: '2rem', fontWeight: 900, margin: '0.35rem 0 0', lineHeight: 1 }}>{payments.length}</p>
                <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem' }}>Tất cả trạng thái</p>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📊</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Bệnh nhân', 'Bác sĩ', 'Số tiền', 'Phương thức', 'Trạng thái', 'Ngày TT'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', color: '#475569', textAlign: 'left', fontWeight: 700, borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Chưa có giao dịch nào</td></tr>
              ) : payments.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.875rem 1rem', color: '#0f172a', fontWeight: 600 }}>{p.appointment?.patient?.name ?? '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>{p.appointment?.doctor?.user?.name ?? '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#16a34a', fontWeight: 700 }}>{p.amount.toLocaleString('vi-VN')}₫</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500 }}>
                      {p.method === 'VNPAY' ? '🏦 VNPay' : p.method === 'CASH' ? '💵 Tiền mặt' : p.method || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: STATUS_BG[p.status] || '#f1f5f9', color: STATUS_COLOR[p.status] || '#64748b' }}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(p.createdAt))}
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
