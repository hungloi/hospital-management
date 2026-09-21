import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { NURSE_THEME } from '@/lib/adminConfig';

const NURSE_NAV = [
  { href: '/nurse', icon: '📋', label: 'Bệnh nhân chờ khám' },
  { href: '/nurse/inpatient', icon: '🛏️', label: 'Quản lý nội trú' },
  { href: '/nurse/vitals', icon: '💓', label: 'Đo sinh hiệu' },
  { href: '/nurse/medicine', icon: '💊', label: 'Cấp phát thuốc' },
];

const FOOTER = <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#fdf2f8', borderRadius: '8px', color: '#ec4899', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>KHỐI ĐIỀU DƯỠNG</div>;

export default async function NurseVitalsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'NURSE') redirect('/login');

  return (
    <DashboardShell title="Điều dưỡng" subtitle="Đo sinh hiệu" items={NURSE_NAV} theme={NURSE_THEME} >
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Đo sinh hiệu (Mạch, Huyết áp)</h1>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💓</div>
          <h3>Chưa có y lệnh đo sinh hiệu</h3>
          <p>Thông tin từ máy đo sinh hiệu sẽ được đồng bộ tại đây.</p>
        </div>
      </div>
    </DashboardShell>
  );
}

