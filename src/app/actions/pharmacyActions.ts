'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function dispensePrescription(prescriptionId: string) {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
      },
    });

    if (!prescription) return { error: 'Không tìm thấy đơn thuốc' };
    if (prescription.status === 'DISPENSED') return { error: 'Đơn thuốc này đã được phát' };

    await prisma.$transaction(async (tx) => {
      for (const item of prescription.items) {
        const qtyToDeduct = Number(item.quantity) || 1;
        const currentMedicine = await tx.medicine.findUnique({ where: { id: item.medicineId } });

        if (!currentMedicine) {
          throw new Error(`Không tìm thấy thuốc ${item.medicine?.name || item.medicineId}`);
        }

        if (currentMedicine.inventory < qtyToDeduct) {
          throw new Error(`Thuốc ${currentMedicine.name} không đủ tồn kho để phát (${currentMedicine.inventory} còn lại)`);
        }

        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { inventory: { decrement: qtyToDeduct } },
        });

        await tx.medicineInventoryLog.create({
          data: {
            medicineId: item.medicineId,
            type: 'OUT',
            quantity: qtyToDeduct,
            description: `Phát thuốc cho đơn ${prescriptionId}`,
            referenceId: prescriptionId,
          },
        });
      }

      await tx.prescription.update({
        where: { id: prescriptionId },
        data: { status: 'DISPENSED' },
      });
    });

    revalidatePath('/pharmacy');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : 'Lỗi hệ thống khi phát thuốc' };
  }
}
