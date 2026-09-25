import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const nurses = await prisma.nurse.findMany({
    include: {
      user: true,
      department: true,
    },
    orderBy: { user: { name: 'asc' } },
  });

  return NextResponse.json(nurses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, phone, address, departmentId, position } = body ?? {};

  if (!name?.toString().trim() || !email?.toString().trim() || !departmentId?.toString().trim()) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
  }

  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) {
    return NextResponse.json({ error: 'Không tìm thấy khoa' }, { status: 404 });
  }

  let user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.toString().trim() || null,
        address: address?.toString().trim() || null,
        role: 'NURSE',
        password: 'changeme',
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        phone: phone?.toString().trim() || null,
        address: address?.toString().trim() || null,
        role: 'NURSE',
      },
    });
  }

  const existingNurse = await prisma.nurse.findFirst({ where: { userId: user.id } });
  const nurse = existingNurse
    ? await prisma.nurse.update({
        where: { id: existingNurse.id },
        data: {
          departmentId,
          position: position?.toString().trim() || 'Y tá',
        },
        include: {
          user: true,
          department: true,
        },
      })
    : await prisma.nurse.create({
        data: {
          userId: user.id,
          departmentId,
          position: position?.toString().trim() || 'Y tá',
        },
        include: {
          user: true,
          department: true,
        },
      });

  return NextResponse.json(nurse, { status: 201 });
}
