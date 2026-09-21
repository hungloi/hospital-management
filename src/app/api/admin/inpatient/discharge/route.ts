import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { inpatientId, dischargeDate } = await req.json();
  if (!inpatientId) return NextResponse.json({ error: 'inpatientId required' }, { status: 400 });

  const record = await prisma.inpatientRecord.findUnique({ where: { id: inpatientId }, include: { roomBed: { include: { room: true } }, patient: true, doctor: true, medicalOrders: true } });
  if (!record) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const discharge = dischargeDate ? new Date(dischargeDate) : new Date();
  const admission = record.admissionDate;
  const msPerDay = 24 * 60 * 60 * 1000;
  const nights = Math.max(1, Math.ceil((discharge.getTime() - admission.getTime()) / msPerDay));
  const roomRate = record.roomBed?.room?.ratePerDay ?? 0;
  const roomTotal = nights * roomRate;

  // Sum medicalOrders cost placeholder: currently medicalOrders don't have price, so set 0
  let medTotal = 0;
  // If later medicalOrders have price, sum here.

  const finalTotal = roomTotal + medTotal;
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: `INV-${Date.now()}-${inpatientId.slice(0, 6)}`,
      total: finalTotal,
      finalTotal,
      status: 'PENDING',
      inpatientRecordId: inpatientId,
      items: {
        create: [
          { description: `Phòng: ${record.roomBed?.room?.name ?? '—'} x ${nights} đêm`, amount: roomRate, quantity: nights },
          ...(medTotal > 0 ? [{ description: 'Thuốc/Chăm sóc', amount: medTotal, quantity: 1 }] : []),
        ]
      }
    }
  });

  await prisma.inpatientRecord.update({ where: { id: inpatientId }, data: { dischargeDate: discharge, status: 'DISCHARGED' } });

  return NextResponse.json({ invoiceId: invoice.id, total: invoice.total });
}
