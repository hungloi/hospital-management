import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { type, itemId, supplierId, batchNo, manufacturingDate, expiryDate, quantity, unitPrice, description } = data;

    if (!supplierId || !batchNo || !expiryDate || !quantity) {
      return NextResponse.json({ error: 'Thiếu thông tin nhập kho' }, { status: 400 });
    }

    if (type === 'MEDICINE') {
      const medicine = await prisma.medicine.findUnique({ where: { id: itemId } });
      if (!medicine) return NextResponse.json({ error: 'Không tìm thấy thuốc' }, { status: 404 });

      const batch = await prisma.supplierMedicineBatch.create({
        data: {
          medicineId: itemId,
          supplierId,
          batchNo,
          manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
          expiryDate: new Date(expiryDate),
          quantity: Number(quantity),
          unitPrice: Number(unitPrice) || 0,
        },
      });

      await prisma.medicine.update({ where: { id: itemId }, data: { inventory: { increment: Number(quantity) }, costPrice: Number(unitPrice) || medicine.costPrice } });
      await prisma.medicineInventoryLog.create({
        data: {
          medicineId: itemId,
          type: 'IN',
          quantity: Number(quantity),
          description: description || `Nhập kho từ ${batchNo}`,
          referenceId: batch.id,
        },
      });

      return NextResponse.json({ ok: true, batch });
    }

    if (type === 'SUPPLY') {
      const supply = await prisma.medicalSupply.findUnique({ where: { id: itemId } });
      if (!supply) return NextResponse.json({ error: 'Không tìm thấy vật tư' }, { status: 404 });

      const batch = await prisma.supplierSupplyBatch.create({
        data: {
          supplyId: itemId,
          supplierId,
          batchNo,
          manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
          expiryDate: new Date(expiryDate),
          quantity: Number(quantity),
          unitPrice: Number(unitPrice) || 0,
        },
      });

      await prisma.medicalSupply.update({ where: { id: itemId }, data: { inventory: { increment: Number(quantity) }, costPrice: Number(unitPrice) || supply.costPrice } });
      await prisma.supplyInventoryLog.create({
        data: {
          supplyId: itemId,
          type: 'IN',
          quantity: Number(quantity),
          description: description || `Nhập kho từ ${batchNo}`,
          referenceId: batch.id,
        },
      });

      return NextResponse.json({ ok: true, batch });
    }

    return NextResponse.json({ error: 'Loại nhập kho không hợp lệ' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to receive inventory' }, { status: 500 });
  }
}
