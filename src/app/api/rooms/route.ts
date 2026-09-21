import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        beds: {
          include: {
            inpatientRecords: true,
          },
        },
        department: true,
        services: true,
      },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const room = await prisma.room.create({
      data: {
        name: data.name,
        type: data.type || 'NORMAL',
        status: 'AVAILABLE',
        floor: data.floor,
        capacity: data.capacity || 1,
        ratePerDay: data.ratePerDay || 0,
        description: data.description,
        departmentId: data.departmentId,
      },
    });

    // Create beds for the room
    const beds = [];
    for (let i = 1; i <= (data.capacity || 1); i++) {
      const bed = await prisma.roomBed.create({
        data: {
          bedNumber: `Giường ${i}`,
          roomId: room.id,
          status: 'AVAILABLE',
        },
      });
      beds.push(bed);
    }

    return NextResponse.json({ room, beds }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
