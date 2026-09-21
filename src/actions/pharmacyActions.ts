'use client';
import { post } from './_client';

export async function dispensePrescription(prescriptionId: string) {
  return post('/api/pharmacy/dispense', { prescriptionId });
}
