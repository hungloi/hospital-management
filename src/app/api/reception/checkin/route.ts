import { NextResponse } from 'next/server';
import { checkInAppointment } from '@/app/actions/receptionActions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointmentId } = body;
    const res = await checkInAppointment(appointmentId);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
