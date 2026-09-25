import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, Number(searchParams.get('page')  ?? 1));
  const limit  = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 50)));
  const type   = searchParams.get('type')   ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const deptId = searchParams.get('departmentId') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  const where: any = {};
  if (type)   where.type   = type;
  if (status) where.status = status;
  if (deptId) where.departmentId = deptId;
  if (search) where.name = { contains: search };

  // Only show patient rooms (exclude OFFICE, LAB_ROOM, EXAM_ROOM)
  where.type = type
    ? type
    : { in: ['NORMAL', 'SERVICE', 'VIP', 'ICU', 'SURGERY', 'OBSERVATION'] };

  const [total, rooms] = await Promise.all([
    prisma.room.count({ where }),
    prisma.room.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
        beds: {
          orderBy: { bedNumber: 'asc' },
          include: {
            inpatientRecords: {
              where: { dischargeDate: null },
              take: 1,
              include: { patient: { select: { name: true } } },
            },
          },
        },
        services: { select: { id: true, name: true, price: true } },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    data: rooms.map((room) => ({
      ...room,
      occupiedBeds:  room.beds.filter((b) => b.status === 'OCCUPIED').length,
      availableBeds: room.beds.filter((b) => b.status === 'AVAILABLE').length,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) {
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
