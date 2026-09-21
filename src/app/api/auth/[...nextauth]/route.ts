import { handlers, auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // If the path is /api/auth/session, return a clean JSON session (compatible with client SessionProvider)
    if (req.nextUrl.pathname.endsWith('/session')) {
      const session = await auth();
      return NextResponse.json(session ?? null);
    }
  } catch (e) {
    console.error('error in custom session handler', e);
  }
  // fallback to NextAuth handlers for other auth endpoints
  return handlers.GET(req as any);
}

export const POST = handlers.POST;
