import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = { gte: startDate, lt: endDate };
    }

    const appointments = await prisma.clinicAppointment.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        department: true,
        serviceCombo: true,
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const appointment = await prisma.clinicAppointment.create({
      data: {
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: 'PENDING',
        patientId: data.patientId,
        doctorId: data.doctorId,
        departmentId: data.departmentId,
        symptoms: data.symptoms,
        queueNumber: data.queueNumber,
        type: data.type || 'SERVICE',
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
