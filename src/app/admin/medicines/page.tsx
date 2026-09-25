import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import Link from 'next/link';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';

export default async function AdminMedicinesPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) redirect('/login');

  const [medicines, supplies] = await Promise.all([
    prisma.medicine.findMany({ orderBy: { name: 'asc' } }),
    prisma.medicalSupply.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const inventoryItems = [
    ...medicines.map((item: any) => ({
      id: item.id,
      type: 'Thuốc',
      name: item.name,
      category: item.category || 'Khác',
      inventory: item.inventory,
      minStock: item.minStock,
      unit: item.unit,
      price: item.price,
      low: item.inventory <= item.minStock,
    })),
    ...supplies.map((item: any) => ({
      id: item.id,
      type: 'Vật tư',
      name: item.name,
      category: item.category || 'Khác',
      inventory: item.inventory,
      minStock: item.minStock,
      unit: item.unit,
      price: item.price,
      low: item.inventory <= item.minStock,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const lowStock = inventoryItems.filter((item) => item.low).length;
  const categories = new Set(inventoryItems.map((item) => item.category)).size;

  return (
    <DashboardShell title={session.user.name || 'ADMIN'} subtitle="Kho & vật tư" items={ADMIN_NAV} theme={ADMIN_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '8px', color: '#38bdf8', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>👑 ADMIN</div>}>
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#2563eb', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase' }}>Kho & vật tư</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.35rem' }}>Kho tổng hợp thuốc và vật tư</h1>
            <p style={{ color: '#475569', margin: 0, maxWidth: '700px' }}>{inventoryItems.length} dòng hàng · {categories} nhóm · {lowStock} dòng cần bổ sung</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/admin/inventory" style={{ padding: '0.6rem 1.1rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
              Xem kho chung
            </Link>
            <Link href="/admin/medicines/new" style={{ padding: '0.6rem 1.25rem', background: '#38bdf8', color: '#0f172a', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
              + Thêm hàng
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard label="Tổng dòng hàng" value={inventoryItems.length} color="#38bdf8" />
          <StatCard label="Đang ở ngưỡng thấp" value={lowStock} color="#fbbf24" />
          <StatCard label="Nhóm phân loại" value={categories} color="#a78bfa" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {inventoryItems.map((item) => (
            <div key={`${item.type}-${item.id}`} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', borderLeft: `4px solid ${item.low ? '#f59e0b' : '#38bdf8'}`, boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                <span style={{ background: item.low ? '#fef2f2' : '#eff6ff', color: item.low ? '#b45309' : '#2563eb', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem' }}>
                  {item.low ? 'Cần bổ sung' : 'Ổn định'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>{item.type}</span>
                <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>{item.category}</span>
              </div>
              <div style={{ marginTop: '0.85rem', color: '#475569', fontSize: '0.84rem' }}>
                Tồn kho: <strong style={{ color: '#0f172a' }}>{item.inventory} {item.unit}</strong>
              </div>
              <div style={{ marginTop: '0.35rem', color: '#64748b', fontSize: '0.8rem' }}>
                Ngưỡng tối thiểu: {item.minStock} · Giá: {Number(item.price).toLocaleString('vi-VN')}₫
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.1rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{label}</div>
      <div style={{ color, fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem' }}>{value}</div>
    </div>
  );
}
