import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { DIRECTOR_THEME } from '@/lib/adminConfig';
import { prisma } from '@/lib/prisma';

export const DIRECTOR_NAV = [
  { href: '/director', icon: '📊', label: 'Tổng quan Bệnh viện' },
  { href: '/director/hr', icon: '👥', label: 'Báo cáo Nhân sự' },
  { href: '/director/finance', icon: '💰', label: 'Báo cáo Tài chính' },
  { href: '/director/approvals', icon: '✍️', label: 'Ký duyệt Y lệnh' },
];

export default async function DirectorDashboard() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  // Cho phép ADMIN hoặc DIRECTOR/DEPUTY_DIRECTOR
  if (!session?.user || !['ADMIN', 'DIRECTOR', 'DEPUTY_DIRECTOR'].includes(role)) {
    redirect('/login');
  }

  // Get current month date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    doctorsCount, 
    patientsCount, 
    staffCount,
    invoices,
    pendingSurgeries,
    pendingOrders
  ] = await Promise.all([
    prisma.user.count({ where: { role: { in: ['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'] } } }),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.user.count({ where: { role: { in: ['STAFF', 'NURSE', 'ACCOUNTANT', 'CHIEF_ACCOUNTANT'] } } }),
    // Get all paid invoices for this month
    prisma.invoice.findMany({ 
      where: { 
        status: 'PAID',
        createdAt: { gte: startOfMonth }
      },
      select: { finalTotal: true }
    }),
    prisma.surgeryOrder.count({ where: { status: 'PENDING' } }),
    prisma.medicalOrder.count({ where: { status: 'PENDING' } }),
  ]);

  const monthlyRevenue = invoices.reduce((sum, inv) => sum + inv.finalTotal, 0);
  const totalPending = pendingSurgeries + pendingOrders;

  return (
    <DashboardShell title="Ban Giám Đốc" subtitle="Bệnh viện Hưng Lợi" items={DIRECTOR_NAV} theme={DIRECTOR_THEME} >
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Xin chào, {(session.user as any).name}</h1>
          <div style={{ background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
            Tháng {now.getMonth() + 1}/{now.getFullYear()}
          </div>
        </div>
        
        {/* Top KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>💰</span>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>DOANH THU THÁNG</p>
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
              {monthlyRevenue.toLocaleString('vi-VN')} đ
            </p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>✍️</span>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>CHỜ KÝ DUYỆT</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: totalPending > 0 ? '#ef4444' : '#10b981' }}>
              {totalPending} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>y lệnh</span>
            </p>
            {totalPending > 0 && (
              <a href="/director/approvals" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Xem ngay →</a>
            )}
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>👥</span>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>TỔNG NHÂN SỰ</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{doctorsCount + staffCount}</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{doctorsCount} Bác sĩ, {staffCount} NV</p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🏥</span>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>BỆNH NHÂN</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{patientsCount}</p>
            <p style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '0.25rem', fontWeight: 600 }}>Đã đăng ký hệ thống</p>
          </div>
        </div>
        
        {/* Quick Actions & Summaries */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Hoạt động gần đây</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                <p style={{ fontWeight: 600, color: '#0f172a' }}>{pendingSurgeries} Lệnh phẫu thuật đang chờ duyệt</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Cần Ban Giám đốc xem xét và phê duyệt trước khi thực hiện.</p>
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ fontWeight: 600, color: '#0f172a' }}>{pendingOrders} Y lệnh nội trú đặc biệt chờ duyệt</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Cần Ban Giám đốc xem xét và phê duyệt trước khi thực hiện.</p>
              </div>
            </div>
          </div>
          
          <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', color: 'white' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>Truy cập nhanh</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="/director/approvals" style={{ display: 'block', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: 600, transition: '0.2s' }}>✍️ Ký duyệt Y lệnh ngay</a>
              <a href="/director/finance" style={{ display: 'block', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: 600, transition: '0.2s' }}>💰 Xem chi tiết Doanh thu</a>
              <a href="/director/hr" style={{ display: 'block', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: 600, transition: '0.2s' }}>👥 Báo cáo Nhân sự</a>
            </div>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
