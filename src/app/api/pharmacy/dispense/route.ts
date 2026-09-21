import { NextResponse } from 'next/server';
import { dispensePrescription } from '@/app/actions/pharmacyActions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prescriptionId } = body;
    const res = await dispensePrescription(prescriptionId);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
