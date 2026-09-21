import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const patients = await prisma.user.findMany({ where: { role: 'PATIENT' }, orderBy: { name: 'asc' } });
  return NextResponse.json(patients);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { name, email, phone, address, dob } = await req.json();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!name?.trim() || !normalizedEmail) {
    return NextResponse.json({ error: 'Họ tên và email là bắt buộc' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: 'Email đã tồn tại trong hệ thống' }, { status: 409 });
  }

  const temporaryPassword = 'Welcome@123';
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      dob: dob ? new Date(dob) : undefined,
      role: 'PATIENT',
      password: hashedPassword,
    },
  });

  return NextResponse.json({ user, temporaryPassword });
}
