import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import InventoryAdjustClient from './InventoryAdjustClient';

export default async function AdminInventoryPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) redirect('/login');

  const now = new Date();
  const expiryWarningWindow = new Date();
  expiryWarningWindow.setDate(expiryWarningWindow.getDate() + 60);

  const [medicines, supplies] = await Promise.all([
    prisma.medicine.findMany({
      orderBy: { name: 'asc' },
      include: {
        batches: {
          where: { expiryDate: { gte: now } },
          orderBy: { expiryDate: 'asc' },
          take: 5,
        },
      },
    }),
    prisma.medicalSupply.findMany({
      orderBy: { name: 'asc' },
      include: {
        batches: {
          where: { expiryDate: { gte: now } },
          orderBy: { expiryDate: 'asc' },
          take: 5,
        },
      },
    }),
  ]);

  const inventoryItems = [
    ...medicines.map((item: any) => ({
      id: item.id,
      type: 'Thuốc',
      name: item.name,
      inventory: item.inventory,
      minStock: item.minStock,
      unit: item.unit,
      price: item.price,
      batches: item.batches || [],
      status: item.inventory <= item.minStock ? 'LOW' : 'OK',
    })),
    ...supplies.map((item: any) => ({
      id: item.id,
      type: 'Vật tư',
      name: item.name,
      inventory: item.inventory,
      minStock: item.minStock,
      unit: item.unit,
      price: item.price,
      batches: item.batches || [],
      status: item.inventory <= item.minStock ? 'LOW' : 'OK',
    })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const inventoryAlerts = inventoryItems.flatMap((item) => {
    const alerts: Array<{ label: string; level: string }> = [];
    if (item.inventory <= item.minStock) {
      alerts.push({ label: `${item.type} ${item.name}: tồn kho thấp`, level: 'danger' });
    }
    const expiring = (item.batches || []).filter((batch: any) => {
      const expiry = new Date(batch.expiryDate);
      return expiry >= now && expiry <= expiryWarningWindow;
    });
    if (expiring.length > 0) {
      alerts.push({ label: `${item.type} ${item.name}: sắp hết hạn lô ${expiring[0].batchNo}`, level: 'warning' });
    }
    return alerts;
  });

  const lowStockCount = inventoryItems.filter((item) => item.inventory <= item.minStock).length;
  const expiringCount = inventoryItems.filter((item) => (item.batches || []).some((batch: any) => {
    const expiry = new Date(batch.expiryDate);
    return expiry >= now && expiry <= expiryWarningWindow;
  })).length;

  return (
    <DashboardShell title={session.user.name!} subtitle="Quản trị viên hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME} footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '8px', color: '#38bdf8', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>👑 ADMIN</div>}>
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase' }}>Kho & vật tư</div>
            <h1 style={{ margin: '0.25rem 0 0.35rem', fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>Quản lý tồn kho chung</h1>
            <p style={{ margin: 0, color: '#64748b', maxWidth: '700px' }}>Theo dõi thuốc và vật tư trong cùng một kho, từ cảnh báo tồn kho thấp đến hàng sắp hết hạn.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.1rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Tổng dòng hàng</div>
            <div style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem' }}>{inventoryItems.length}</div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.1rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Tồn kho thấp</div>
            <div style={{ color: '#fbbf24', fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem' }}>{lowStockCount}</div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.1rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Sắp hết hạn</div>
            <div style={{ color: '#f87171', fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem' }}>{expiringCount}</div>
          </div>
        </div>

        {inventoryAlerts.length > 0 && (
          <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#92400e', fontWeight: 700 }}>⚠️ Cảnh báo kho</h3>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#78350f' }}>
              {inventoryAlerts.map((alert, idx) => (<li key={`${alert.label}-${idx}`}>{alert.label}</li>))}
            </ul>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1.25fr 0.75fr' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.2rem' }}>
            <h2 style={{ margin: '0 0 0.75rem', color: '#0f172a', fontSize: '1.05rem' }}>Kho tổng hợp</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '0.7rem 0.65rem' }}>Loại</th>
                    <th style={{ padding: '0.7rem 0.65rem' }}>Tên</th>
                    <th style={{ padding: '0.7rem 0.65rem' }}>Tồn kho</th>
                    <th style={{ padding: '0.7rem 0.65rem' }}>Ngưỡng</th>
                    <th style={{ padding: '0.7rem 0.65rem' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr key={`${item.type}-${item.id}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.7rem 0.65rem', color: '#475569' }}>{item.type}</td>
                      <td style={{ padding: '0.7rem 0.65rem', color: '#0f172a', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '0.7rem 0.65rem', color: '#0f172a' }}>{item.inventory} {item.unit}</td>
                      <td style={{ padding: '0.7rem 0.65rem', color: '#64748b' }}>{item.minStock}</td>
                      <td style={{ padding: '0.7rem 0.65rem' }}>
                        <span style={{ background: item.status === 'LOW' ? '#fef3c7' : '#dcfce7', color: item.status === 'LOW' ? '#92400e' : '#15803d', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
                          {item.status === 'LOW' ? '⚠ Cần bổ sung' : '✓ Ổn định'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.2rem' }}>
            <h2 style={{ margin: '0 0 0.75rem', color: '#0f172a', fontSize: '1.05rem' }}>Điều chỉnh tồn kho</h2>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.9rem' }}>Nhập/xuất kho nhanh từ một form chung.</p>
            <InventoryAdjustClient />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

