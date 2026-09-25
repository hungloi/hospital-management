import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Departments that don't use Doctor/Nurse model for their staff
const NON_MEDICAL_DEPTS = new Set([
  'Phòng Công Nghệ Thông Tin',
  'Phòng Kế Toán - Tài Chính',
  'Phòng Nhân Sự - Hành Chính',
  'Phòng Vệ Sinh và Bảo Vệ',
  'Phòng Đào Tạo - Nghiên Cứu Khoa Học',
  'Phòng Quản Lý Chất Lượng',
]);

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get('departmentId');

  const [departments, shifts] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    prisma.staffShift.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: {
        department: true,
        doctor: { include: { user: true } },
        nurse: { include: { user: true } },
      },
      orderBy: [{ department: { name: 'asc' } }, { dayOfWeek: 'asc' }, { startTime: 'asc' }],
    }),
  ]);

  // If a department is selected, return its staff
  let doctors: any[] = [];
  let nurses: any[] = [];

  if (departmentId) {
    const dept = departments.find(d => d.id === departmentId);
    if (dept && !NON_MEDICAL_DEPTS.has(dept.name)) {
      [doctors, nurses] = await Promise.all([
        prisma.doctor.findMany({
          where: { departmentId },
          include: { user: true },
          orderBy: { user: { name: 'asc' } },
        }),
        prisma.nurse.findMany({
          where: { departmentId },
          include: { user: true },
          orderBy: { user: { name: 'asc' } },
        }),
      ]);
    } else if (dept && NON_MEDICAL_DEPTS.has(dept.name)) {
      // For non-medical depts, nurses = all staff assigned (in DB they are stored as nurses)
      nurses = await prisma.nurse.findMany({
        where: { departmentId },
        include: { user: true },
        orderBy: { user: { name: 'asc' } },
      });
    }
  } else {
    [doctors, nurses] = await Promise.all([
      prisma.doctor.findMany({ include: { user: true }, orderBy: { user: { name: 'asc' } } }),
      prisma.nurse.findMany({ include: { user: true }, orderBy: { user: { name: 'asc' } } }),
    ]);
  }

  return NextResponse.json({
    departments,
    doctors,
    nurses,
    shifts,
    nonMedicalDepts: Array.from(NON_MEDICAL_DEPTS),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { scheduleType, dayOfWeek, scheduleDate, shiftType, startTime, endTime, notes, departmentId, staffType, staffId } = body ?? {};

  if (!shiftType || !startTime || !endTime || !departmentId || !staffType || !staffId) {
    return NextResponse.json({ error: 'Thiếu thông tin ca làm việc' }, { status: 400 });
  }

  if (scheduleType === 'SPECIFIC') {
    if (!scheduleDate) {
      return NextResponse.json({ error: 'Vui lòng chọn ngày làm cụ thể' }, { status: 400 });
    }
    const parsedDate = new Date(scheduleDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Ngày làm cụ thể không hợp lệ' }, { status: 400 });
    }
  } else if (!dayOfWeek) {
    return NextResponse.json({ error: 'Vui lòng chọn ngày trong tuần' }, { status: 400 });
  }

  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) {
    return NextResponse.json({ error: 'Không tìm thấy khoa' }, { status: 404 });
  }

  const data: any = {
    dayOfWeek: scheduleType === 'RECURRING' ? dayOfWeek : null,
    scheduleDate: scheduleType === 'SPECIFIC' ? new Date(scheduleDate) : null,
    shiftType,
    startTime,
    endTime,
    notes: notes?.toString().trim() || null,
    departmentId,
  };

  if (staffType === 'DOCTOR') {
    data.doctorId = staffId;
  } else {
    data.nurseId = staffId;
  }

  const created = await prisma.staffShift.create({
    data,
    include: {
      department: true,
      doctor: { include: { user: true } },
      nurse: { include: { user: true } },
    },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.staffShift.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
