import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const [departments, patients, doctors, appointments] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({ where: { role: 'PATIENT' }, orderBy: { name: 'asc' } }),
    prisma.doctor.findMany({
      include: { user: true, department: true },
      orderBy: { user: { name: 'asc' } },
    }),
    prisma.clinicAppointment.findMany({
      include: {
        patient: true,
        doctor: { include: { user: true, department: true } },
        department: true,
      },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    }),
  ]);

  return NextResponse.json({ departments, patients, doctors, appointments });
}
