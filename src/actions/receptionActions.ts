'use client';
import { post } from './_client';

export async function checkInAppointment(appointmentId: string) {
  return post('/api/reception/checkin', { appointmentId });
}
