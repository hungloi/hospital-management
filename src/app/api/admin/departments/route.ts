import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const departments = await prisma.department.findMany({
    include: {
      doctors: { include: { user: true } },
      nurses: { include: { user: true } },
      rooms: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(departments.map((department) => ({
    ...department,
    doctorCount: department.doctors.length,
    nurseCount: department.nurses.length,
    roomCount: department.rooms.length,
  })));
}
