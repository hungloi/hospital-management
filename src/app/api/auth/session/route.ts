import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    // auth() is the server-side helper exported from src/auth.ts
    const session = await auth();
    return NextResponse.json(session ?? null);
  } catch (err) {
    console.error('Error in /api/auth/session:', err);
    return NextResponse.json(null);
  }
}
