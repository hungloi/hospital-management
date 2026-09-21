import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Server component
export default async function PayPage({ params }: { params: { id?: string } | Promise<{ id?: string }> }) {
  const resolvedParams = await params as { id?: string } | undefined;
  const id = resolvedParams?.id;
  if (!id) notFound();
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'PATIENT') redirect('/login');
  const userId = (session.user as any).id;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { patient: true, doctor: { include: { user: true } }, payments: true }
  });

  if (!appointment) return <div style={{ padding: '2rem' }}>Không tìm thấy lịch hẹn.</div>;
  if (appointment.patientId !== userId) return <div style={{ padding: '2rem' }}>Bạn không có quyền truy cập trang này.</div>;

  // Determine amount: prefer existing payment.amount, otherwise use doctor's consultation fee or default
  const defaultAmount = 200000; // 200k VND fallback
  const paidPayment = appointment.payments?.find(p => p.status === 'PAID');
  const pendingPayment = appointment.payments?.find(p => p.status === 'PENDING');
  const existingPayment = paidPayment ?? pendingPayment ?? undefined;
  const amount = existingPayment?.amount ?? appointment.doctor.consultationFee ?? defaultAmount;
  const paymentStatus = existingPayment?.status ?? 'NONE';

  // Build VietQR preview for quick transfer option (same bank used by print template)
  const hospitalBankKey = 'vib-397435692-compact2.png';
  const qrInfo = encodeURIComponent(`Thanh toan vien phi ${appointment.patient?.name ?? 'BN'} - ${appointment.id.slice(-6).toUpperCase()}`);
  const vietQrUrl = `https://img.vietqr.io/image/${hospitalBankKey}?amount=${Math.round(amount)}&addInfo=${qrInfo}&accountName=BENHVIEN%20HUNG%20LOI`;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>💳 Thanh toán cho lịch hẹn</h1>
      <div style={{ marginTop: '1rem', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 800 }}>{appointment.doctor.user.name}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{new Date(appointment.date).toLocaleString('vi-VN')}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{amount.toLocaleString('vi-VN')}₫</div>
            <div style={{ color: paymentStatus === 'PAID' ? '#16a34a' : '#d97706', fontWeight: 700 }}>{paymentStatus === 'PAID' ? '✓ Đã thanh toán' : (paymentStatus === 'PENDING' ? '⏳ Chờ thanh toán' : 'Chưa thanh toán')}</div>
          </div>
        </div>

        <p style={{ color: '#475569', marginTop: '0.5rem' }}><strong>Mã lịch hẹn:</strong> {appointment.id}</p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div id="pay-actions">
              {/* Client-side payment actions */}
              {/* @ts-ignore-next-line */}
              <PayClient appointmentId={appointment.id} initialAmount={amount} paymentExists={!!existingPayment} paymentStatus={paymentStatus} />
            </div>
            <div style={{ marginTop: '12px', color: '#475569' }}>
              <div><strong>Thanh toán khác:</strong></div>
              <div style={{ marginTop: '6px' }}>• Thanh toán tiền mặt tại quầy</div>
              <div style={{ marginTop: '6px' }}>• Chuyển khoản / Quét QR ngân hàng (xem bên) </div>
            </div>
          </div>

          <div style={{ width: '220px', textAlign: 'center', borderLeft: '1px solid #e6eef7', paddingLeft: '12px' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>Quét mã để thanh toán</div>
            <img src={vietQrUrl} alt="VietQR" style={{ width: '180px', height: '180px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>VIB - 397435692</div>

            <a href={`/print/receipt/${appointment.id}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '10px', padding: '8px 10px', background: '#f8fafc', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>In biên lai</a>
          </div>
        </div>

      </div>
    </div>
  );
}

import PayClient from './PayClient';
