import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import Link from 'next/link';




export default async function AdminSuppliesPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/login');

  const supplies = await prisma.medicalSupply.findMany({ orderBy: { name: 'asc' } });
  const lowStock = supplies.filter((s) => s.inventory <= s.minStock).length;
  const categories = new Set(supplies.map((s) => s.category)).size;

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '8px', color: '#38bdf8', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>👑 ADMIN</div>}>
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>📦 Vật tư y tế</h1>
            <p style={{ color: '#94b3b8', marginTop: '4px' }}>{supplies.length} loại vật tư · {categories} nhóm · {lowStock} loại sắp hết</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/admin/suppliers" style={{ padding: '0.6rem 1.25rem', background: '#10b981', color: '#0f172a', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Nhà cung cấp</Link>
            <Link href="/admin/medical-supplies/new" style={{ padding: '0.6rem 1.25rem', background: '#38bdf8', color: '#0f172a', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>+ Thêm Vật tư</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {supplies.map(s => {
            const low = s.inventory <= s.minStock;
            return (
              <div key={s.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', borderLeft: `4px solid ${low ? '#f59e0b' : '#10b981'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</div>
                  <span style={{ background: low ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.08)', color: low ? '#fbbf24' : '#10b981', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem' }}>
                    {low ? 'Sắp hết' : 'Đủ'}
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>Đơn vị: {s.unit}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(16,185,129,0.06)', color: '#10b981', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>{s.category}</span>
                  <span style={{ color: '#475569', fontSize: '0.78rem' }}>{s.inventory} {s.unit}</span>
                </div>
                <div style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.78rem' }}>
                  Tối thiểu: {s.minStock} · Giá: {Number(s.price).toLocaleString('vi-VN')}₫
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}


