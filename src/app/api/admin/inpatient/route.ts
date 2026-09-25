import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const records = await prisma.inpatientRecord.findMany({
    include: {
      patient: true,
      doctor: { include: { user: true } },
      roomBed: { include: { room: true } },
      medicalOrders: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
    orderBy: { admissionDate: 'desc' },
  });

  return NextResponse.json(records);
}
