import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_THEME } from '@/lib/adminConfig';

const STAFF_NAV = [
  { href: '/staff', icon: '📝', label: 'Công việc của tôi' },
  { href: '/staff/tickets', icon: '🎫', label: 'Hỗ trợ (Tickets)' },
  { href: '/staff/documents', icon: '📁', label: 'Tài liệu nội bộ' },
];

const FOOTER = <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>KHỐI HÀNH CHÍNH</div>;

export default async function StaffDashboard() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'STAFF') redirect('/login');

  return (
    <DashboardShell title="Nhân viên" subtitle="Khối Hành chính" items={STAFF_NAV} theme={ADMIN_THEME} >
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Việc cần làm hôm nay</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Quản lý các yêu cầu hỗ trợ và công việc được giao</p>
          </div>
          <button style={{ padding: '0.6rem 1.25rem', background: '#3b82f6', color: 'white', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            + Tạo Yêu cầu mới
          </button>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h3>Tuyệt vời! Bạn không có công việc nào tồn đọng</h3>
          <p>Tất cả các ticket hỗ trợ đã được giải quyết.</p>
        </div>
      </div>
    </DashboardShell>
  );
}

