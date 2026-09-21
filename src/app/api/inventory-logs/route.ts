import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const medicineId = searchParams.get('medicineId');
    const supplyId = searchParams.get('supplyId');
    const type = searchParams.get('type');
    const days = searchParams.get('days') || '30';

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    const medicineLogs = medicineId
      ? await prisma.medicineInventoryLog.findMany({
          where: {
            medicineId,
            type: type || undefined,
            createdAt: { gte: dateFrom },
          },
          include: { medicine: true },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const supplyLogs = supplyId
      ? await prisma.supplyInventoryLog.findMany({
          where: {
            supplyId,
            type: type || undefined,
            createdAt: { gte: dateFrom },
          },
          include: { supply: true },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    return NextResponse.json({ medicineLogs, supplyLogs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const quantity = Number(data.quantity || 0);
    const type = data.type || 'ADJUSTMENT';

    if (!quantity || quantity < 0) {
      return NextResponse.json({ error: 'Số lượng không hợp lệ' }, { status: 400 });
    }

    if (data.medicineId) {
      const medicine = await prisma.medicine.findUnique({ where: { id: data.medicineId } });
      if (!medicine) {
        return NextResponse.json({ error: 'Không tìm thấy thuốc' }, { status: 404 });
      }

      const delta = type === 'IN' ? quantity : -quantity;
      const nextInventory = medicine.inventory + delta;
      if (nextInventory < 0) {
        return NextResponse.json({ error: 'Tồn kho không đủ' }, { status: 400 });
      }

      await prisma.medicine.update({
        where: { id: data.medicineId },
        data: {
          inventory: nextInventory,
        },
      });

      const log = await prisma.medicineInventoryLog.create({
        data: {
          medicineId: data.medicineId,
          type,
          quantity,
          description: data.description,
          referenceId: data.referenceId,
        },
      });

      return NextResponse.json(log, { status: 201 });
    }

    if (data.supplyId) {
      const supply = await prisma.medicalSupply.findUnique({ where: { id: data.supplyId } });
      if (!supply) {
        return NextResponse.json({ error: 'Không tìm thấy vật tư' }, { status: 404 });
      }

      const delta = type === 'IN' ? quantity : -quantity;
      const nextInventory = supply.inventory + delta;
      if (nextInventory < 0) {
        return NextResponse.json({ error: 'Tồn kho không đủ' }, { status: 400 });
      }

      await prisma.medicalSupply.update({
        where: { id: data.supplyId },
        data: {
          inventory: nextInventory,
        },
      });

      const log = await prisma.supplyInventoryLog.create({
        data: {
          supplyId: data.supplyId,
          type,
          quantity,
          description: data.description,
          referenceId: data.referenceId,
        },
      });

      return NextResponse.json(log, { status: 201 });
    }

    return NextResponse.json({ error: 'medicineId or supplyId required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create inventory log' }, { status: 500 });
  }
}
