import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { appointmentId, comboId } = await req.json();
  if (!appointmentId) return NextResponse.json({ error: 'appointmentId required' }, { status: 400 });
  await prisma.appointment.update({ where: { id: appointmentId }, data: { serviceComboId: comboId || null } });
  return NextResponse.json({ ok: true });
}
