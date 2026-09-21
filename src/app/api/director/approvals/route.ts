import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (!session?.user || !['ADMIN', 'DIRECTOR', 'DEPUTY_DIRECTOR'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, id, action } = await req.json();

    if (!type || !id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let updatedOrder;

    if (type === 'SURGERY') {
      const newStatus = action === 'APPROVE' ? 'APPROVED' : 'CANCELLED';
      updatedOrder = await prisma.surgeryOrder.update({
        where: { id },
        data: { status: newStatus }
      });
    } else if (type === 'MEDICAL') {
      // Note: MedicalOrder schema default has PENDING and DONE. We add APPROVED, REJECTED.
      const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      updatedOrder = await prisma.medicalOrder.update({
        where: { id },
        data: { status: newStatus }
      });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updatedOrder });

  } catch (error: any) {
    console.error('Approvals API Error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
