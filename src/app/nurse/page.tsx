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

export default async function NurseDashboard() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'NURSE') redirect('/login');

  return (
    <DashboardShell title="Điều dưỡng" subtitle="Trạm Y tá" items={NURSE_NAV} theme={NURSE_THEME} >
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Danh sách bệnh nhân chờ</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Gọi tên và sắp xếp bệnh nhân vào phòng khám</p>
          </div>
          <button style={{ padding: '0.6rem 1.25rem', background: '#ec4899', color: 'white', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            + Thêm bệnh nhân cấp cứu
          </button>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
          <h3>Chưa có bệnh nhân nào đang chờ</h3>
          <p>Dữ liệu kết nối hàng đợi đang được đồng bộ...</p>
        </div>
      </div>
    </DashboardShell>
  );
}

