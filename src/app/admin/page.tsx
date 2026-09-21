import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/login');

  const [totalPatients, totalDoctors, pendingAppts, totalRevenue, recentAppts, deptStats, pendingPrescriptions, medicineStockData, supplyStockData, todayRevenue] = await Promise.all([
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.doctor.count(),
    prisma.appointment.count({ where: { status: 'PENDING' } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
    prisma.appointment.findMany({
      take: 10, orderBy: { createdAt: 'desc' },
      include: { patient: true, doctor: { include: { user: true, department: true } }, payments: true }
    }),
    prisma.department.findMany({
      include: { _count: { select: { doctors: true } } }
    }),
    prisma.prescription.count({ where: { status: 'PENDING' } }),
    prisma.medicine.findMany({ select: { id: true, inventory: true, minStock: true } }),
    prisma.medicalSupply.findMany({ select: { id: true, inventory: true, minStock: true } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'PAID',
        paidDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  const lowStockMedicines = medicineStockData.filter((item) => item.inventory <= item.minStock).length;
  const lowStockSupplies = supplyStockData.filter((item) => item.inventory <= item.minStock).length;

  const STATUS_COLOR: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#38bdf8', EXAMINING: '#a78bfa', COMPLETED: '#34d399', CANCELLED: '#f87171' };
  const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', EXAMINING: 'Đang khám', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };

  return (
    <DashboardShell
      title={session.user.name!}
      subtitle="ADMIN"
      items={ADMIN_NAV}
      theme={ADMIN_THEME}
    >
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Tổng quan hệ thống</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(new Date())}
          </p>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          {[
            { label: 'Bệnh nhân', value: totalPatients, icon: '⊙', color: '#60a5fa', sub: 'Đã đăng ký', bg: 'rgba(96,165,250,0.08)' },
            { label: 'Bác sĩ', value: totalDoctors, icon: '⊚', color: '#34d399', sub: `${deptStats.length} khoa`, bg: 'rgba(52,211,153,0.08)' },
            { label: 'Đơn chờ phát', value: pendingPrescriptions, icon: '⊕', color: '#fbbf24', sub: 'Từ phòng khám', bg: 'rgba(251,191,36,0.08)' },
            { label: 'Doanh thu hôm nay', value: `${((todayRevenue._sum.amount || 0) / 1_000_000).toFixed(1)}M`, icon: '⊞', color: '#a78bfa', sub: 'VNĐ đã thu', bg: 'rgba(167,139,250,0.08)' },
          ].map(c => (
            <div key={c.label} style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.5rem',
              borderTop: `3px solid ${c.color}`,
              boxShadow: '0 1px 8px rgba(15,23,42,0.06)',
              transition: 'box-shadow 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0, fontWeight: 500 }}>{c.label}</p>
                  <p style={{ color: c.color, fontSize: '2.25rem', fontWeight: 900, margin: '0.35rem 0 0', lineHeight: 1 }}>{c.value}</p>
                  <p style={{ color: '#64748b', fontSize: '0.72rem', margin: '0.35rem 0 0', fontWeight: 500 }}>{c.sub}</p>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: c.color }}>
                  {c.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Operations summary */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem' }}>📈 Tổng hợp vận hành</h2>
              <Link href="/admin/inventory" style={{ color: '#2563eb', fontSize: '0.8rem', textDecoration: 'none' }}>Kho & thuốc →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: 700 }}>⚠️ Thuốc tồn kho thấp</div>
                <div style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem' }}>{lowStockMedicines}</div>
                <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.25rem' }}>Mục cần bổ sung</div>
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ color: '#b45309', fontSize: '0.8rem', fontWeight: 700 }}>🧰 Vật tư tồn kho thấp</div>
                <div style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem' }}>{lowStockSupplies}</div>
                <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.25rem' }}>Cần kiểm tra</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.9rem 1rem' }}>
              <div style={{ color: '#1d4ed8', fontWeight: 700, fontSize: '0.9rem' }}>💵 Doanh thu tổng</div>
              <div style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>{((totalRevenue._sum.amount || 0) / 1_000_000).toFixed(1)} triệu VNĐ</div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem' }}>📋 Lịch hẹn gần nhất</h2>
              <Link href="/admin/appointments" style={{ color: '#2563eb', fontSize: '0.8rem', textDecoration: 'none' }}>Xem tất cả →</Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    {['Bệnh nhân', 'Bác sĩ', 'Khoa', 'Ngày khám', 'Trạng thái', 'TT'].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentAppts.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.7rem 0.75rem', color: '#0f172a' }}>{a.patient.name}</td>
                      <td style={{ padding: '0.7rem 0.75rem', color: '#475569' }}>{a.doctor.user.name}</td>
                      <td style={{ padding: '0.7rem 0.75rem', color: '#64748b' }}>{a.doctor.department?.name || '—'}</td>
                      <td style={{ padding: '0.7rem 0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(a.date))}
                      </td>
                      <td style={{ padding: '0.7rem 0.75rem' }}>
                        <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: `${STATUS_COLOR[a.status] || '#94a3b8'}22`, color: STATUS_COLOR[a.status] || '#94a3b8' }}>
                          {STATUS_LABEL[a.status] || a.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.7rem 0.75rem' }}>
                        {(a.payments && a.payments.length > 0) ? (
                          <span style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: 600 }}>✓ Đã TT</span>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Chưa TT</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Departments */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem' }}>🏢 Khoa phòng</h2>
              <Link href="/admin/departments" style={{ color: '#38bdf8', fontSize: '0.8rem', textDecoration: 'none' }}>Quản lý →</Link>
            </div>
            {deptStats.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>{d.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{d.floor}</div>
                </div>
                <div style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {d._count.doctors} BS
                </div>
              </div>
            ))}
            <Link href="/admin/departments" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', padding: '0.6rem', background: 'rgba(56,189,248,0.08)', border: '1px dashed #38bdf844', borderRadius: '10px', color: '#38bdf8', fontSize: '0.85rem', textDecoration: 'none' }}>
              + Thêm khoa mới
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
