import { NextResponse } from 'next/server';
import { submitLabResult } from '@/app/actions/labActions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, result } = body;
    const res = await submitLabResult(orderId, result);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
