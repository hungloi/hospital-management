import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  let session;
  try {
    session = await auth();
  } catch (err) {
    console.error('Auth error in GET /api/patient/profile', err);
    return NextResponse.json({ message: 'Auth error' }, { status: 500 });
  }

  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any)?.id;
  if (!userId) return NextResponse.json({ message: 'Missing user id in session' }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, phone: true, role: true } });
    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Profile fetch error', err);
    return NextResponse.json({ message: 'Không thể lấy thông tin người dùng' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let session;
  try {
    session = await auth();
  } catch (err) {
    console.error('Auth error in PUT /api/patient/profile', err);
    // continue to allow fallback via patientId in body
  }

  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const fallbackId = String(body.patientId || '').trim();

    if (!name || !email || !phone) return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin.' }, { status: 400 });

    // prefer session user id, otherwise fall back to patientId from request body
    const userId = (session?.user as any)?.id || (fallbackId || null);
    if (!userId) return NextResponse.json({ message: 'Unauthorized or missing patientId' }, { status: 401 });

    // update user
    const user = await prisma.user.update({ where: { id: userId }, data: { name, email, phone } });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Profile update error', err);
    return NextResponse.json({ message: 'Cập nhật thất bại' }, { status: 500 });
  }
}
