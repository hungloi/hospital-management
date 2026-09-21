import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ACCOUNTANT_THEME } from '@/lib/adminConfig';

const ACCOUNTANT_NAV = [
  { href: '/accountant', icon: '💳', label: 'Hóa đơn chưa thu' },
  { href: '/accountant/history', icon: '📝', label: 'Lịch sử giao dịch' },
  { href: '/accountant/insurance', icon: '🏥', label: 'Thanh toán BHYT' },
  { href: '/accountant/reports', icon: '📊', label: 'Báo cáo doanh thu' },
];

const FOOTER = <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#ede9fe', borderRadius: '8px', color: '#8b5cf6', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>TÀI CHÍNH KẾ TOÁN</div>;

export default async function AccountantHistoryPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== 'ACCOUNTANT' && role !== 'CHIEF_ACCOUNTANT')) redirect('/login');

  return (
    <DashboardShell title="Tài chính Kế toán" subtitle="Lịch sử giao dịch" items={ACCOUNTANT_NAV} theme={ACCOUNTANT_THEME} >
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Lịch sử giao dịch</h1>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3>Chưa có giao dịch nào</h3>
          <p>Mọi giao dịch thanh toán thành công sẽ được lưu trữ tại đây.</p>
        </div>
      </div>
    </DashboardShell>
  );
}

