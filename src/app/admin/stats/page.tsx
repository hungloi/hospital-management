import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import StatsCharts from './StatsCharts';


export default async function AdminStatsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/login');

  const [totalAppointments, totalPatients, totalDoctors, totalRevenue, statusCounts, topDoctors, recentAppointments, prescriptions, lowStockMedicines, lowStockSupplies] = await Promise.all([
    prisma.appointment.count(),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.doctor.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
    prisma.appointment.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.doctor.findMany({
      include: { user: true, _count: { select: { appointments: true } } },
      orderBy: { appointments: { _count: 'desc' } },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.prescription.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.medicine.findMany({ select: { id: true, inventory: true, minStock: true } }),
    prisma.medicalSupply.findMany({ select: { id: true, inventory: true, minStock: true } }),
  ]);

  const byDate: Record<string, number> = {};
  recentAppointments.forEach(a => {
    const d = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(a.createdAt));
    byDate[d] = (byDate[d] || 0) + 1;
  });
  const prescriptionByDate: Record<string, number> = {};
  prescriptions.forEach(p => {
    const d = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(p.createdAt));
    prescriptionByDate[d] = (prescriptionByDate[d] || 0) + 1;
  });
  const chartData = Object.entries(byDate).map(([date, count]) => ({ date, count }));
  const prescriptionChartData = Object.entries(prescriptionByDate).map(([date, count]) => ({ date, count }));
  const statusData = statusCounts.map(s => ({ name: s.status, value: s._count.status }));
  const revenueAlertCount = lowStockMedicines.filter((item) => item.inventory <= item.minStock).length + lowStockSupplies.filter((item) => item.inventory <= item.minStock).length;

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME} >
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.75rem' }}>📈 Báo cáo thống kê</h1>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Tổng lịch hẹn', value: totalAppointments, icon: '📅', color: '#38bdf8' },
            { label: 'Bệnh nhân', value: totalPatients, icon: '👥', color: '#a78bfa' },
            { label: 'Bác sĩ', value: totalDoctors, icon: '👨‍⚕️', color: '#34d399' },
            { label: 'Doanh thu', value: `${(totalRevenue._sum.amount || 0).toLocaleString('vi-VN')}₫`, icon: '💰', color: '#fbbf24' },
          ].map(c => (
            <div key={c.label} style={{ background: '#f8fafc', border: `1px solid ${c.color}33`, borderRadius: '14px', padding: '1.25rem', borderLeft: `4px solid ${c.color}` }}>
              <div style={{ fontSize: '1.5rem' }}>{c.icon}</div>
              <div style={{ color: c.color, fontSize: '1.6rem', fontWeight: 800, marginTop: '0.4rem' }}>{c.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* KPI summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '14px', padding: '1rem 1.25rem', borderTop: '3px solid #38bdf8' }}>
            <div style={{ color: '#0369a1', fontWeight: 700, fontSize: '0.8rem' }}>Đơn thuốc 30 ngày</div>
            <div style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 900, marginTop: '0.3rem', lineHeight: 1 }}>{prescriptions.length}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '14px', padding: '1rem 1.25rem', borderTop: '3px solid #fbbf24' }}>
            <div style={{ color: '#92400e', fontWeight: 700, fontSize: '0.8rem' }}>Mặt hàng cần bổ sung</div>
            <div style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 900, marginTop: '0.3rem', lineHeight: 1 }}>{revenueAlertCount}</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '1rem 1.25rem', borderTop: '3px solid #34d399' }}>
            <div style={{ color: '#047857', fontWeight: 700, fontSize: '0.8rem' }}>Doanh thu tổng</div>
            <div style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: 900, marginTop: '0.3rem', lineHeight: 1 }}>{(totalRevenue._sum.amount || 0).toLocaleString('vi-VN')}₫</div>
          </div>
        </div>

        {/* Charts */}
        <StatsCharts chartData={chartData} prescriptionChartData={prescriptionChartData} statusData={statusData} topDoctors={topDoctors} />
      </div>
    </DashboardShell>
  );
}



