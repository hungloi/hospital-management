import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  let name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();
  const password = String(body.password || '').trim();

  // accept registration with phone+password only; derive a display name if missing
  if (!phone || !password) {
    return NextResponse.json({ message: 'Vui lòng điền SĐT và mật khẩu.' }, { status: 400 });
  }

  if (!name) {
    // derive a fallback name from phone
    name = phone.includes('@') ? phone.split('@')[0] : `BN-${phone}`;
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { phone },
        { email: phone },
      ],
    },
  });

  if (existingUser) {
    return NextResponse.json({ message: 'Số điện thoại hoặc email đã được sử dụng.' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const email = phone.includes('@') ? phone : `${phone}@benhvien.local`;

  await prisma.user.create({
    data: {
      name,
      phone,
      email,
      password: hashedPassword,
      role: 'PATIENT',
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
