import { NextRequest, NextResponse } from 'next/server';
import { createVNPayUrl } from '@/lib/vnpay';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { itemizeInvoiceForAppointment } from '@/lib/invoice';

export async function POST(req: NextRequest) {
  try {
    const { appointmentId, amount: requestedAmount, items } = await req.json();

    // If there's already a pending VNPAY payment for this appointment, reuse it (avoid duplicates)
    if (appointmentId) {
      const existing = await prisma.payment.findFirst({ where: { appointmentId, status: 'PENDING', method: 'VNPAY' } });
      if (existing) {
        // If existing has a valid txnRef and a positive amount, return a VNPay URL for it (reuse)
        if (existing.txnRef && existing.amount && existing.amount > 0) {
          const paymentUrl = createVNPayUrl({
            amount: existing.amount,
            orderInfo: `Thanh toan lich hen ${appointmentId.slice(-8).toUpperCase()}`,
            txnRef: existing.txnRef,
            ipAddr: req.headers.get('x-forwarded-for') || '127.0.0.1',
          });
          return NextResponse.json({ url: paymentUrl, invoiceId: existing.invoiceId });
        }
        // otherwise fall through to create/update invoice and payment with a correct amount
      }
    }

    // Compute a sane amount if none provided or <= 0: use doctor's consultation fee or a default
    let amount = typeof requestedAmount === 'number' ? requestedAmount : 0;
    if (!amount || amount <= 0) {
      // try to fetch appointment and doctor's fee
      let fallback = 200000; // default 200k
      if (appointmentId) {
        const appt = await prisma.appointment.findUnique({ where: { id: appointmentId }, include: { doctor: true } });
        if (appt?.doctor?.consultationFee) fallback = appt.doctor.consultationFee;
      }
      amount = fallback;
    }

    // Remove any previous zero-amount pending payments for this appointment to avoid duplicates
    if (appointmentId) {
      await prisma.payment.deleteMany({ where: { appointmentId, amount: { lte: 0 }, status: 'PENDING' } });
    }

    // Create Invoice (with at least a consultation item if no items provided)
    const txnRef = nanoid(12);
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: `INV-${Date.now()}-${appointmentId ? appointmentId.slice(0, 8) : 'GEN'}`,
        total: amount,
        finalTotal: amount,
        status: 'PENDING',
        appointmentId,
        items: items && items.length ? { create: items.map((it: any) => ({ description: it.description, amount: it.amount, quantity: it.quantity || 1 })) }
          : { create: [{ description: 'Phí khám bác sĩ', amount, quantity: 1 }] },
      }
    });

    // Attempt to auto-itemize invoice using appointment details (doctor fee, prescription, lab orders, room nights)
    try {
      if (appointmentId) {
        await itemizeInvoiceForAppointment(appointmentId, invoice.id);
      }
    } catch (e) {
      console.warn('Auto-itemize failed for appointment', appointmentId, e);
    }

    // Refresh invoice to pick up updated total from itemize
    const refreshedInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    // If caller didn't request a specific amount (or requested <=0), default to itemized invoice total.
    if ((typeof requestedAmount !== 'number' || requestedAmount <= 0) && refreshedInvoice && refreshedInvoice.total && refreshedInvoice.total > 0) {
      amount = refreshedInvoice.total;
    }

    // If an existing pending payment exists without txnRef, update it instead of creating a new one
    let payment = await prisma.payment.findFirst({ where: { appointmentId, status: 'PENDING', method: 'VNPAY' } });
    if (payment) {
      payment = await prisma.payment.update({ where: { id: payment.id }, data: { amount, txnRef, invoiceId: invoice.id } });
    } else {
      payment = await prisma.payment.create({
        data: {
          amount,
          status: 'PENDING',
          method: 'VNPAY',
          txnRef,
          appointmentId,
          invoiceId: invoice.id
        },
      });
    }

    // Audit: log payment creation
    try {
      const { promises: fs } = await import('fs');
      const path = (await import('path')).join(process.cwd(), 'logs');
      await fs.mkdir(path, { recursive: true });
      await fs.appendFile((await import('path')).join(path, 'audit.log'), `[${new Date().toISOString()}] payment_created: { txnRef: ${txnRef}, amount: ${amount}, appointmentId: ${appointmentId}, invoiceId: ${invoice.id} }\n`);
    } catch (e) {
      console.error('audit write failed', e);
    }

    const paymentUrl = createVNPayUrl({
      amount,
      orderInfo: `Thanh toan lich hen ${appointmentId ? appointmentId.slice(-8).toUpperCase() : invoice.id.slice(-8).toUpperCase()}`,
      txnRef,
      ipAddr: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ url: paymentUrl, invoiceId: invoice.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Lỗi tạo thanh toán' }, { status: 500 });
  }
}
