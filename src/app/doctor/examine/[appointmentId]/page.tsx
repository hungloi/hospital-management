import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ExamineClient from './ExamineClient';

export default async function ExaminePage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role)) redirect('/login');

  const { appointmentId } = await params;

  const [appointment, clinicAppointment, medicines] = await Promise.all([
    prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, prescription: { include: { items: { include: { medicine: true } } } }, labOrders: true }
    }),
    prisma.clinicAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        prescription: { include: { items: { include: { medicine: true } } } },
        labOrders: true,
        clinicRecord: true,
      },
    }),
    prisma.medicine.findMany({ orderBy: { name: 'asc' } })
  ]);

  const record = appointment ?? clinicAppointment;
  if (!record) notFound();

  const examinationType = appointment ? 'APPOINTMENT' : 'CLINIC_APPOINTMENT';

  return <ExamineClient appointment={record} medicines={medicines} examinationType={examinationType} />;
}
