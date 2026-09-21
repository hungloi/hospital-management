import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { DIRECTOR_THEME } from '@/lib/adminConfig';
import { prisma } from '@/lib/prisma';
import { DIRECTOR_NAV } from '../page';

export default async function DirectorFinancePage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['ADMIN', 'DIRECTOR', 'DEPUTY_DIRECTOR'].includes(role)) {
    redirect('/login');
  }

  // Lấy dữ liệu hoá đơn thực tế
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Tổng doanh thu (hoá đơn đã thanh toán)
  const paidInvoices = await prisma.invoice.findMany({ 
    where: { status: 'PAID', createdAt: { gte: startOfMonth } },
    select: { finalTotal: true }
  });
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.finalTotal, 0);

  // Tổng công nợ (hoá đơn chưa thanh toán)
  const pendingInvoices = await prisma.invoice.findMany({ 
    where: { status: { in: ['PENDING', 'OVERDUE'] } },
    select: { finalTotal: true }
  });
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.finalTotal, 0);

  // Phân tích doanh thu từ BHYT (những ca khám có BHYT) vs Dịch vụ (thông qua Appointment type)
  // Tính tương đối bằng cách đếm số lượng ca để chia tỉ trọng, vì logic tính tiền khá phức tạp
  const [bhytAppts, serviceAppts] = await Promise.all([
    prisma.appointment.count({ where: { type: 'BHYT', status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { type: 'SERVICE', status: 'COMPLETED' } })
  ]);
  const totalAppts = (bhytAppts + serviceAppts) || 1; // avoid divide by zero
  const bhytRatio = bhytAppts / totalAppts;
  
  const estimatedBhytRevenue = totalRevenue * bhytRatio;
  const estimatedServiceRevenue = totalRevenue * (1 - bhytRatio);

  return (
    <DashboardShell title="Ban Giám Đốc" subtitle="Báo cáo Tài chính" items={DIRECTOR_NAV} theme={DIRECTOR_THEME} >
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Báo cáo Doanh thu</h1>
            <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Tháng {now.getMonth() + 1}/{now.getFullYear()} - Dữ liệu thực tế từ hệ thống Kế toán</p>
          </div>
          <button style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>🖨️ Xuất báo cáo (Excel)</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>💰</span>
              <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>TỔNG DOANH THU ĐÃ THU</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{totalRevenue.toLocaleString('vi-VN')} đ</p>
            <p style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 600 }}>Thực tế từ hoá đơn PAID</p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>CÔNG NỢ (CHƯA THU)</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: totalPending > 0 ? '#ef4444' : '#64748b' }}>{totalPending.toLocaleString('vi-VN')} đ</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>Hoá đơn PENDING / OVERDUE</p>
          </div>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>💳</span>
              <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>BHYT CHI TRẢ (Ước tính)</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{estimatedBhytRevenue.toLocaleString('vi-VN')} đ</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>~ {Math.round(bhytRatio * 100)}% tổng thu</p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3>Đồ thị doanh thu theo ngày</h3>
          <p>Biểu đồ chi tiết đang được cập nhật. Số liệu trên đã được đồng bộ trực tiếp từ phân hệ Kế toán theo thời gian thực.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
