import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const appointment = await prisma.clinicAppointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        department: true,
        clinicRecord: true,
        prescription: { include: { items: { include: { medicine: true } } } },
        labOrders: true,
      },
    });
    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const appointment = await prisma.clinicAppointment.update({
      where: { id },
      data: {
        status: data.status,
        diagnosis: data.diagnosis,
        notes: data.notes,
      },
    });
    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.clinicAppointment.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Appointment deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
