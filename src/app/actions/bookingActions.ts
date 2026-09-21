'use server';

import { prisma } from '@/lib/prisma';
import { sendBookingConfirmationEmail } from '@/lib/email';

export async function submitBooking(formData: FormData) {
  try {
    const name = (formData.get('name') as string) || '';
    const email = (formData.get('email') as string) || '';
    const phone = (formData.get('phone') as string) || '';
    const date = formData.get('date') as string;
    const notes = (formData.get('notes') as string) || '';
    
    // New fields
    const departmentId = formData.get('departmentId') as string;
    const doctorId = formData.get('doctorId') as string;
    const type = (formData.get('type') as string) || 'SERVICE'; // BHYT or SERVICE
    const healthInsuranceNo = (formData.get('healthInsuranceNo') as string) || '';


    // 1. Use provided patientId if present (logged-in user), otherwise find or create by email
    const patientId = formData.get('patientId') as string | null;
    let user = null;
    if (patientId) {
      user = await prisma.user.findUnique({ where: { id: patientId } });
    }

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            phone: phone || undefined,
            password: 'default-password-change-later',
            role: 'PATIENT',
          }
        });
      }
    }

    // 2. Find doctor
    let finalDoctorId = doctorId;
    if (!finalDoctorId) {
      // If patient didn't select doctor, find first doctor in the department
      const doc = await prisma.doctor.findFirst({
        where: { departmentId: departmentId || undefined }
      });
      if (doc) {
        finalDoctorId = doc.id;
      } else {
        // Fallback to any doctor
        const anyDoc = await prisma.doctor.findFirst();
        if (anyDoc) finalDoctorId = anyDoc.id;
      }
    }

    if (!finalDoctorId) {
       return { success: false, error: 'Không tìm thấy bác sĩ nào' };
    }

    // 3. Create the appointment (No payment required upfront)
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        notes,
        patientId: user.id,
        doctorId: finalDoctorId,
        status: 'CONFIRMED', // Confirm by default, patient pays later
        type: type || 'SERVICE',
        healthInsuranceNo: type === 'BHYT' ? healthInsuranceNo : null
      },
      include: { doctor: { include: { user: true } } }
    });

    // 4. Gửi email xác nhận
    await sendBookingConfirmationEmail({
      to: email,
      patientName: name,
      doctorName: appointment.doctor.user.name,
      date: appointment.date,
      appointmentId: appointment.id,
    });

    return { success: true, requirePayment: false };
  } catch (error) {
    console.error('Booking Error:', error);
    return { success: false, error: 'Failed to submit booking' };
  }
}

