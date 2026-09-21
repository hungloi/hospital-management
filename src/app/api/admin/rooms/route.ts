import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const rooms = await prisma.room.findMany({
    include: {
      department: true,
      beds: {
        orderBy: { bedNumber: 'asc' },
        include: {
          inpatientRecords: {
            orderBy: { admissionDate: 'desc' },
            take: 1,
            include: {
              patient: true,
            },
          },
        },
      },
      services: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(
    rooms.map((room) => ({
      ...room,
      occupiedBeds: room.beds.filter((bed) => bed.status === 'OCCUPIED').length,
      availableBeds: room.beds.filter((bed) => bed.status === 'AVAILABLE').length,
    })),
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const {
    name,
    type = 'NORMAL',
    status = 'AVAILABLE',
    floor,
    capacity = 1,
    ratePerDay = 0,
    description,
    departmentId,
    services = [],
  } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Tên phòng là bắt buộc' }, { status: 400 });
  }

  const room = await prisma.room.create({
    data: {
      name: name.trim(),
      type,
      status,
      floor: floor ?? null,
      capacity: Number(capacity) || 1,
      ratePerDay: Number(ratePerDay) || 0,
      description: description?.trim() || null,
      departmentId: departmentId || null,
      services: {
        create: (Array.isArray(services) ? services : [])
          .map((service: string) => service.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
      },
    },
  });

  const bedCount = Math.max(Number(capacity) || 1, 1);
  const beds = await Promise.all(
    Array.from({ length: bedCount }, (_, index) =>
      prisma.roomBed.create({
        data: {
          roomId: room.id,
          bedNumber: `Giường ${index + 1}`,
          status: 'AVAILABLE',
        },
      }),
    ),
  );

  return NextResponse.json({ room, beds }, { status: 201 });
}
