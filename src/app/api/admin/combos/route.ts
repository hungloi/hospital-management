import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { promises as fs } from 'fs';
import path from 'path';

async function writeAudit(entry: any) {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    await fs.mkdir(logsDir, { recursive: true });
    const file = path.join(logsDir, 'audit.log');
    const line = `[${new Date().toISOString()}] ${JSON.stringify(entry)}\n`;
    await fs.appendFile(file, line, 'utf8');
  } catch (e) {
    // swallow errors to not break admin actions
    console.error('audit write failed', e);
  }
}

async function ensureDefaultDepartmentId() {
  let department = await prisma.department.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!department) {
    department = await prisma.department.create({
      data: {
        name: 'Khoa Khám',
        description: 'Khoa mặc định cho bệnh nhân và bác sĩ mới.',
        floor: '1',
      },
    });
  }
  return department.id;
}

export async function GET(req: Request) {
  const combos = await prisma.serviceCombo.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(combos);
}

export async function POST(req: Request) {
  // Support both combo management and lab-service admin actions
  const body = await req.json();

  // If action present, perform admin-only actions
  if (body?.action) {
    // Allow createE2E in development without auth (convenience for local testing)
    if (body.action === 'createE2E' && process.env.NODE_ENV !== 'production') {
      // create a doctor, patient, appointment, prescription, lab order, medicine
      const docEmail = 'e2e-doctor@example.test';
      let doctorUser = await prisma.user.findUnique({ where: { email: docEmail } });
      if (!doctorUser) {
        doctorUser = await prisma.user.create({ data: { name: 'E2E Doctor', email: docEmail, password: 'changeme', role: 'DOCTOR' } });
      }
      let doctor = await prisma.doctor.findFirst({ where: { userId: doctorUser.id } });
      if (!doctor) {
        const departmentId = await ensureDefaultDepartmentId();
        doctor = await prisma.doctor.create({ data: { userId: doctorUser.id, departmentId, specialty: 'General', consultationFee: 250000 } });
      }

      const patientEmail = 'e2e-patient@example.test';
      let patient = await prisma.user.findUnique({ where: { email: patientEmail } });
      if (!patient) patient = await prisma.user.create({ data: { name: 'E2E Patient', email: patientEmail, password: 'changeme', role: 'PATIENT' } });

      let med = await prisma.medicine.findFirst({ where: { name: 'Paracetamol' } });
      if (!med) med = await prisma.medicine.create({ data: { name: 'Paracetamol', price: 20000 } });

      const apptDate = new Date(); apptDate.setDate(apptDate.getDate() + 1);
      const appointment = await prisma.appointment.create({ data: { date: apptDate, patientId: patient.id, doctorId: doctor.id, status: 'PENDING' } });

      const prescription = await prisma.prescription.create({ data: { appointmentId: appointment.id } });
      await prisma.prescriptionItem.create({ data: { prescriptionId: prescription.id, medicineId: med.id, dosage: '500mg', duration: '7 ngày', instructions: 'Uống sau ăn', quantity: 2 } });

      await prisma.labOrder.create({ data: { appointmentId: appointment.id, type: 'CBC', price: 150000 } });

      return NextResponse.json({ ok: true, appointmentId: appointment.id });
    }

    let session: any = null;
    try {
      session = await auth();
      if (!session?.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    } catch (e) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    if (body.action === 'getLabTypes') {
      const orders = await prisma.labOrder.findMany({ orderBy: { createdAt: 'asc' } });
      const map: Record<string, { type: string; price: number | null }> = {};
      for (const o of orders) {
        if (!map[o.type]) map[o.type] = { type: o.type, price: o.price ?? null };
      }
      return NextResponse.json(Object.values(map));
    }

    if (body.action === 'updateLabPrice') {
      const { type, price } = body;
      if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 });
      const p = Number(price || 0);
      await prisma.labOrder.updateMany({ where: { type }, data: { price: p } });
      await writeAudit({ user: session.user.email || session.user.id, action: 'updateLabPrice', type, price: p });
      return NextResponse.json({ ok: true });
    }

    // Invoice related admin actions
    if (body.action === 'getInvoiceByAppointment') {
      const { appointmentId } = body;
      if (!appointmentId) return NextResponse.json({ error: 'appointmentId required' }, { status: 400 });
      const invoice = await prisma.invoice.findFirst({ where: { appointmentId }, include: { items: true } });
      return NextResponse.json(invoice || null);
    }

    // Create test data for E2E flow (admin only)
    if (body.action === 'createE2E') {
      // create a doctor, patient, appointment, prescription, lab order, medicine
      const docEmail = 'e2e-doctor@example.test';
      let doctorUser = await prisma.user.findUnique({ where: { email: docEmail } });
      if (!doctorUser) {
        doctorUser = await prisma.user.create({ data: { name: 'E2E Doctor', email: docEmail, password: 'changeme', role: 'DOCTOR' } });
      }
      let doctor = await prisma.doctor.findFirst({ where: { userId: doctorUser.id } });
      if (!doctor) {
        const departmentId = await ensureDefaultDepartmentId();
        doctor = await prisma.doctor.create({ data: { userId: doctorUser.id, departmentId, specialty: 'General', consultationFee: 250000 } });
      }

      const patientEmail = 'e2e-patient@example.test';
      let patient = await prisma.user.findUnique({ where: { email: patientEmail } });
      if (!patient) patient = await prisma.user.create({ data: { name: 'E2E Patient', email: patientEmail, password: 'changeme', role: 'PATIENT' } });

      let med = await prisma.medicine.findFirst({ where: { name: 'Paracetamol' } });
      if (!med) med = await prisma.medicine.create({ data: { name: 'Paracetamol', price: 20000 } });

      const apptDate = new Date(); apptDate.setDate(apptDate.getDate() + 1);
      const appointment = await prisma.appointment.create({ data: { date: apptDate, patientId: patient.id, doctorId: doctor.id, status: 'PENDING' } });

      const prescription = await prisma.prescription.create({ data: { appointmentId: appointment.id } });
      await prisma.prescriptionItem.create({ data: { prescriptionId: prescription.id, medicineId: med.id, dosage: '500mg', duration: '7 ngày', instructions: 'Uống sau ăn', quantity: 2 } });

      await prisma.labOrder.create({ data: { appointmentId: appointment.id, type: 'CBC', price: 150000 } });

      return NextResponse.json({ ok: true, appointmentId: appointment.id });
    }

    if (body.action === 'getPaymentsByInvoice') {
      const { invoiceId } = body;
      if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
      const payments = await prisma.payment.findMany({ where: { invoiceId }, orderBy: { createdAt: 'asc' } });
      return NextResponse.json(payments);
    }

    if (body.action === 'updateInvoiceItem') {
      const { itemId, description, amount, quantity } = body;
      if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });
      const updateData: any = {};
      if (description !== undefined) updateData.description = description;
      if (amount !== undefined) updateData.amount = Number(amount);
      if (quantity !== undefined) updateData.quantity = Number(quantity);
      const item = await prisma.invoiceItem.update({ where: { id: itemId }, data: updateData });
      // recompute invoice total
      const invoiceItems = await prisma.invoiceItem.findMany({ where: { invoiceId: item.invoiceId } });
      const total = invoiceItems.reduce((s, it) => s + (Number(it.amount || 0) * Number(it.quantity || 1)), 0);
      await prisma.invoice.update({ where: { id: item.invoiceId }, data: { total } });
      const invoice = await prisma.invoice.findUnique({ where: { id: item.invoiceId }, include: { items: true } });
      await writeAudit({ user: session.user.email || session.user.id, action: 'updateInvoiceItem', itemId, changes: updateData, invoiceId: item.invoiceId });
      return NextResponse.json(invoice);
    }

    // Simulation helper for testing only (admin-only): mark a payment as PAID/FAILED by txnRef and run reconciliation
    if (body.action === 'simulateMarkPayment') {
      const { txnRef, success } = body;
      if (!txnRef) return NextResponse.json({ error: 'txnRef required' }, { status: 400 });
      const payment = await prisma.payment.findUnique({ where: { txnRef } });
      if (!payment) return NextResponse.json({ error: 'payment not found' }, { status: 404 });
      const newStatus = success ? 'PAID' : 'FAILED';
      await prisma.payment.update({ where: { txnRef }, data: { status: newStatus, vnpayResponse: JSON.stringify({ simulated: true, success }) } });

      if (payment.invoiceId) {
        // recompute paid sum
        const paidSumResult = await prisma.payment.aggregate({ where: { invoiceId: payment.invoiceId, status: 'PAID' }, _sum: { amount: true } });
        const paidSum = paidSumResult._sum.amount ?? 0;
        const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
        const invoiceTotal = invoice?.total ?? 0;
        const newInvoiceStatus = paidSum >= invoiceTotal && invoiceTotal > 0 ? 'PAID' : (paidSum > 0 ? 'PARTIAL' : invoice?.status ?? 'PENDING');
        await prisma.invoice.update({ where: { id: payment.invoiceId }, data: { status: newInvoiceStatus } });
        await writeAudit({ user: session.user.email || session.user.id, action: 'simulateMarkPayment', txnRef, success, invoiceId: payment.invoiceId });
      }

      if (success && payment.appointmentId) {
        await prisma.appointment.update({ where: { id: payment.appointmentId }, data: { status: 'CONFIRMED' } });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  }

  // Default: create combo
  const { name, description, price } = body;
  const combo = await prisma.serviceCombo.create({ data: { name, description, price: Number(price) || 0 } });
  await writeAudit({ action: 'createCombo', name, price: Number(price) || 0 });
  return NextResponse.json(combo);
}
