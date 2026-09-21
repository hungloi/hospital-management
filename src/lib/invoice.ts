import { prisma } from '@/lib/prisma';

export async function itemizeInvoiceForAppointment(appointmentId: string, invoiceId?: string) {
  // Fetch appointment and related data
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      doctor: true,
      prescription: { include: { items: { include: { medicine: true } } } },
      labOrders: true,
      patient: true,
      invoices: true,
    },
  });
  if (!appt) return null;

  // Build items
  const items: { description: string; amount: number; quantity?: number }[] = [];

  // Consultation fee
  const consultationFee = appt.doctor?.consultationFee ?? 0;
  if (consultationFee > 0) {
    items.push({ description: `Phí khám bác sĩ (${appt.doctor?.specialty || 'Khám'})`, amount: consultationFee, quantity: 1 });
  }

  // Prescription items (use medicine.price if available)
  if (appt.prescription?.items && appt.prescription.items.length) {
    for (const pi of appt.prescription.items) {
      const med = pi.medicine;
      const price = med?.price ?? 0;
      // Quantity not stored explicitly; assume 1 unit line per prescription item (admin can edit later)
      const desc = `${med?.name || 'Thuốc'} ${pi.dosage || ''}`.trim();
      items.push({ description: desc, amount: price, quantity: 1 });
    }
  }

  // Lab orders: add a summed placeholder item per labOrder (no prices in schema)
  if (appt.labOrders && appt.labOrders.length) {
    for (const lo of appt.labOrders) {
      // If later a price field is added to LabOrder, use it. For now set 0 and label the test name.
      items.push({ description: `Chi phí xét nghiệm: ${lo.type}`, amount: 0, quantity: 1 });
    }
  }

  // If appointment has inpatient invoices, skip room calculation here (handled at discharge)

  // If caller provided an invoiceId, replace items for that invoice; otherwise create a new invoice
  let invoice = null;
  if (invoiceId) {
    // remove existing items and recreate
    await prisma.invoiceItem.deleteMany({ where: { invoiceId } });
    for (const it of items) {
      await prisma.invoiceItem.create({ data: { invoiceId, description: it.description, amount: it.amount, quantity: it.quantity ?? 1 } });
    }
    const total = items.reduce((s, i) => s + (i.amount * (i.quantity ?? 1)), 0);
    invoice = await prisma.invoice.update({ where: { id: invoiceId }, data: { total, finalTotal: total } });
  } else {
    const total = items.reduce((s, i) => s + (i.amount * (i.quantity ?? 1)), 0);
    invoice = await prisma.invoice.create({
      data: {
        invoiceNo: `INV-${Date.now()}-${appointmentId.slice(0, 8)}`,
        total,
        finalTotal: total,
        status: 'PENDING',
        appointmentId,
        items: items.length ? { create: items.map(i => ({ description: i.description, amount: i.amount, quantity: i.quantity ?? 1 })) } : undefined,
      },
    });
  }

  return invoice;
}
