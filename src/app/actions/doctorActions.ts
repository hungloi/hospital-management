'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createMedicalOrder(data: FormData) {
  const inpatientRecordId = data.get('recordId') as string;
  const doctorId = data.get('doctorId') as string;
  const orderText = data.get('orderText') as string;

  if (!orderText) return { error: 'Vui lòng nhập nội dung y lệnh' };

  try {
    await prisma.medicalOrder.create({
      data: {
        orderText,
        inpatientRecordId,
        doctorId
      }
    });
    revalidatePath(`/doctor/inpatient/${inpatientRecordId}`);
    return { success: true };
  } catch (e) {
    return { error: 'Có lỗi xảy ra khi tạo y lệnh' };
  }
}

export async function dischargePatient(recordId: string) {
  try {
    await prisma.inpatientRecord.update({
      where: { id: recordId },
      data: { status: 'DISCHARGED', dischargeDate: new Date() }
    });
    revalidatePath('/doctor/inpatient');
    revalidatePath(`/doctor/inpatient/${recordId}`);
    return { success: true };
  } catch (e) {
    return { error: 'Không thể xuất viện' };
  }
}
