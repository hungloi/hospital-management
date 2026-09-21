import { NextRequest, NextResponse } from 'next/server';
import { verifyVNPayCallback } from '@/lib/vnpay';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function GET(req: NextRequest) {
  const query: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => { query[key] = value; });

  const { isValid, responseCode, txnRef, amount } = verifyVNPayCallback(query);

  if (!isValid) {
    return NextResponse.redirect(new URL('/payment/result?status=error&msg=invalid_signature', req.url));
  }

  const isSuccess = responseCode === '00';
  const newStatus = isSuccess ? 'PAID' : 'FAILED';

  // Cập nhật Payment record
  const payment = await prisma.payment.findUnique({ where: { txnRef } });
  if (payment) {
    await prisma.payment.update({
      where: { txnRef },
      data: {
        status: newStatus,
        vnpayResponse: JSON.stringify(query),
      },
    });

    // Audit log
    try {
      const { promises: fs } = await import('fs');
      const path = (await import('path')).join(process.cwd(), 'logs');
      await fs.mkdir(path, { recursive: true });
      await fs.appendFile((await import('path')).join(path, 'audit.log'), `[${new Date().toISOString()}] vnpay_callback: ${JSON.stringify({ txnRef, responseCode, amount, success: isSuccess })}\n`);
    } catch (e) {
      console.error('audit write failed', e);
    }

    // Nếu thanh toán liên kết với Invoice, cập nhật trạng thái Invoice
    if (payment.invoiceId) {
      // Recompute sum of PAID payments for this invoice and set invoice status accordingly
      if (isSuccess) {
        // Update this payment to PAID already done above; now sum
        const paidSumResult = await prisma.payment.aggregate({
          where: { invoiceId: payment.invoiceId, status: 'PAID' },
          _sum: { amount: true },
        });
        const paidSum = paidSumResult._sum.amount ?? 0;

        // fetch invoice total
        const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
        const invoiceTotal = invoice?.total ?? 0;

        const newInvoiceStatus = paidSum >= invoiceTotal && invoiceTotal > 0 ? 'PAID' : (paidSum > 0 ? 'PARTIAL' : invoice?.status ?? 'PENDING');
        await prisma.invoice.update({ where: { id: payment.invoiceId }, data: { status: newInvoiceStatus } });
      } else {
        // if payment failed and no paid payments exist, mark invoice still PENDING (or FAILED if business requires)
        const anyPaid = await prisma.payment.findFirst({ where: { invoiceId: payment.invoiceId, status: 'PAID' } });
        if (!anyPaid) {
          // keep PENDING; if desired, one could set FAILED. Keep conservative.
          await prisma.invoice.update({ where: { id: payment.invoiceId }, data: { status: 'PENDING' } });
        }
      }
    }

    // Nếu thanh toán thành công, cập nhật trạng thái lịch hẹn (nếu có)
    if (isSuccess && payment.appointmentId) {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' },
      });
    }
  }

  const resultUrl = isSuccess
    ? `/payment/result?status=success&txn=${txnRef}&amount=${amount}`
    : `/payment/result?status=failed&txn=${txnRef}`;

  return NextResponse.redirect(new URL(resultUrl, req.url));
}
