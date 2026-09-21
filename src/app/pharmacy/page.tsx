import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { PHARMACY_THEME } from '@/lib/adminConfig';
import PharmacyClient from './PharmacyClient';

const PHARMACY_NAV = [
  { href: '/pharmacy', icon: '💊', label: 'Quầy phát thuốc' },
];

const FOOTER = <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#dcfce7', borderRadius: '8px', color: '#16a34a', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>💊 KHOA DƯỢC</div>;

export default async function PharmacyPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'PHARMACIST') redirect('/login');

  const pendingPrescriptions = await prisma.prescription.findMany({
    where: { status: 'PENDING' },
    include: {
      appointment: { include: { patient: true, doctor: { include: { user: true } } } },
      items: { include: { medicine: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  const recentPrescriptions = await prisma.prescription.findMany({
    where: { status: 'DISPENSED' },
    include: {
      appointment: { include: { patient: true, doctor: { include: { user: true } } } },
      items: { include: { medicine: true } }
    },
    orderBy: { updatedAt: 'desc' },
    take: 10
  });

  // Load kho thuốc và cảnh báo
  const now = new Date();
  const expiryWarningWindow = new Date();
  expiryWarningWindow.setDate(expiryWarningWindow.getDate() + 60);

  const inventory = await prisma.medicine.findMany({
    orderBy: { name: 'asc' },
    include: {
      batches: {
        where: {
          expiryDate: {
            gte: now,
          },
        },
        orderBy: { expiryDate: 'asc' },
        take: 5,
      },
    },
  });

  const inventoryAlerts = inventory.flatMap((medicine: any) => {
    const alerts: any[] = [];
    if (medicine.inventory <= medicine.minStock) {
      alerts.push({
        medicineId: medicine.id,
        medicineName: medicine.name,
        type: 'low-stock',
        message: `Tồn kho thấp: ${medicine.inventory}/${medicine.minStock} ${medicine.unit}`,
      });
    }

    const expiring = (medicine.batches || []).filter((batch: any) => {
      const expiry = new Date(batch.expiryDate);
      return expiry >= now && expiry <= expiryWarningWindow;
    });

    if (expiring.length > 0) {
      const nextBatch = expiring[0];
      alerts.push({
        medicineId: medicine.id,
        medicineName: medicine.name,
        type: 'expiring',
        message: `Sắp hết hạn lô ${nextBatch.batchNo}: ${new Date(nextBatch.expiryDate).toLocaleDateString('vi-VN')}`,
      });
    }

    return alerts;
  });

  return (
    <DashboardShell title="Khoa Dược" subtitle="Phát thuốc" items={PHARMACY_NAV} theme={PHARMACY_THEME} >
      <PharmacyClient pending={pendingPrescriptions} recent={recentPrescriptions} inventory={inventory} inventoryAlerts={inventoryAlerts} />
    </DashboardShell>
  );
}

