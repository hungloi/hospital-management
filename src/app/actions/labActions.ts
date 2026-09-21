'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitLabResult(orderId: string, result: string) {
  try {
    await prisma.labOrder.update({
      where: { id: orderId },
      data: {
        result,
        status: 'DONE',
        updatedAt: new Date(),
      }
    });

    revalidatePath('/lab');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Lỗi khi cập nhật kết quả xét nghiệm' };
  }
}
