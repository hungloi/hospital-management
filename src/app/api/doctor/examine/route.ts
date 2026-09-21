import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    appointmentId, examinationType = 'APPOINTMENT', diagnosis, notes, prescriptionItems, labOrders,
    requireAdmission, admissionReason,
    requireSurgery, surgeryName, diagnosisBefore
  } = await req.json();

  try {
    const isClinic = examinationType === 'CLINIC_APPOINTMENT';

    if (isClinic) {
      const clinicAppointment = await prisma.clinicAppointment.findUnique({ where: { id: appointmentId } });
      if (!clinicAppointment) {
        return NextResponse.json({ error: 'Clinic appointment not found' }, { status: 404 });
      }

      await prisma.clinicAppointment.update({
        where: { id: appointmentId },
        data: { diagnosis, notes, status: 'COMPLETED' }
      });

      await prisma.clinicRecord.upsert({
        where: { clinicAppointmentId: appointmentId },
        create: {
          diagnosis,
          treatment: notes || 'Điều trị theo đơn',
          notes,
          patientId: clinicAppointment.patientId,
          clinicAppointmentId: appointmentId,
        },
        update: {
          diagnosis,
          treatment: notes || 'Điều trị theo đơn',
          notes,
        },
      });

      if (prescriptionItems?.length > 0) {
        const existing = await prisma.prescription.findUnique({ where: { clinicAppointmentId: appointmentId } });
        if (existing) {
          await prisma.prescriptionItem.deleteMany({ where: { prescriptionId: existing.id } });
          await prisma.prescriptionItem.createMany({
            data: prescriptionItems.map((item: any) => ({ ...item, prescriptionId: existing.id }))
          });
        } else {
          await prisma.prescription.create({
            data: {
              clinicAppointmentId: appointmentId,
              notes,
              items: { create: prescriptionItems.map((item: any) => ({ medicineId: item.medicineId, dosage: item.dosage, duration: item.duration, instructions: item.instructions })) }
            }
          });
        }
      }

      if (labOrders?.length > 0) {
        await prisma.labOrder.deleteMany({ where: { clinicAppointmentId: appointmentId } });
        await prisma.labOrder.createMany({
          data: labOrders.map((o: any) => ({ clinicAppointmentId: appointmentId, type: o.type, description: o.description || '' }))
        });
      }

      if (requireAdmission && clinicAppointment.patientId && clinicAppointment.doctorId) {
        await prisma.inpatientRecord.create({
          data: {
            patientId: clinicAppointment.patientId,
            doctorId: clinicAppointment.doctorId,
            reason: admissionReason || diagnosis
          }
        });
      }

      if (requireSurgery && clinicAppointment.patientId && clinicAppointment.doctorId) {
        await prisma.surgeryOrder.create({
          data: {
            patientId: clinicAppointment.patientId,
            doctorId: clinicAppointment.doctorId,
            surgeryName: surgeryName || 'Phẫu thuật chưa phân loại',
            diagnosisBefore: diagnosisBefore || diagnosis
          }
        });
      }

      return NextResponse.json({ success: true });
    }

    // Update appointment with diagnosis and status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { diagnosis, notes, status: 'COMPLETED' }
    });

    // Create Medical Record
    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (appt) {
      await prisma.medicalRecord.upsert({
        where: { appointmentId },
        create: { diagnosis, treatment: notes || 'Điều trị theo đơn', notes, patientId: appt.patientId, appointmentId },
        update: { diagnosis, treatment: notes || 'Điều trị theo đơn', notes }
      });
    }

    // Create Prescription if there are items
    if (prescriptionItems?.length > 0) {
      const existing = await prisma.prescription.findUnique({ where: { appointmentId } });
      if (existing) {
        await prisma.prescriptionItem.deleteMany({ where: { prescriptionId: existing.id } });
        await prisma.prescriptionItem.createMany({
          data: prescriptionItems.map((item: any) => ({ ...item, prescriptionId: existing.id }))
        });
      } else {
        await prisma.prescription.create({
          data: {
            appointmentId,
            notes,
            items: { create: prescriptionItems.map((item: any) => ({ medicineId: item.medicineId, dosage: item.dosage, duration: item.duration, instructions: item.instructions })) }
          }
        });
      }
    }

    // Create Lab Orders
    if (labOrders?.length > 0) {
      await prisma.labOrder.deleteMany({ where: { appointmentId } });
      await prisma.labOrder.createMany({
        data: labOrders.map((o: any) => ({ appointmentId, type: o.type, description: o.description || '' }))
      });
    }

    // Create Inpatient Record
    if (requireAdmission && appt?.patientId && appt?.doctorId) {
      await prisma.inpatientRecord.create({
        data: {
          patientId: appt.patientId,
          doctorId: appt.doctorId,
          reason: admissionReason || diagnosis
        }
      });
    }

    // Create Surgery Order
    if (requireSurgery && appt?.patientId && appt?.doctorId) {
      await prisma.surgeryOrder.create({
        data: {
          patientId: appt.patientId,
          doctorId: appt.doctorId,
          surgeryName: surgeryName || 'Phẫu thuật chưa phân loại',
          diagnosisBefore: diagnosisBefore || diagnosis
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
