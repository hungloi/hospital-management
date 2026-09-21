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

export default async function StaffTicketsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'STAFF') redirect('/login');

  return (
    <DashboardShell title="Khối Hành chính" subtitle="Hỗ trợ nội bộ" items={STAFF_NAV} theme={ADMIN_THEME} >
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Quản lý Yêu cầu Hỗ trợ (Tickets)</h1>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
          <h3>Chưa có yêu cầu hỗ trợ mới</h3>
          <p>Mọi vấn đề từ các khoa/phòng sẽ được chuyển đến đây.</p>
        </div>
      </div>
    </DashboardShell>
  );
}

