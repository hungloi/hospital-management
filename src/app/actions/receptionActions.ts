'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function checkInAppointment(appointmentId: string) {
  try {
    // Tìm số thứ tự lớn nhất trong ngày của bác sĩ đó
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) return { error: 'Không tìm thấy lịch khám' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxQueue = await prisma.appointment.findFirst({
      where: {
        doctorId: appointment.doctorId,
        date: { gte: today },
        queueNumber: { not: null }
      },
      orderBy: { queueNumber: 'desc' }
    });

    const nextQueue = (maxQueue?.queueNumber || 0) + 1;

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CONFIRMED',
        queueNumber: nextQueue
      }
    });

    revalidatePath('/reception');
    return { success: true, queueNumber: nextQueue };
  } catch (error) {
    console.error(error);
    return { error: 'Lỗi khi check-in' };
  }
}
