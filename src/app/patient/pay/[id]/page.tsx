import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PayClient from './PayClient';

export default async function PayPage({ params }: { params: { id?: string } | Promise<{ id?: string }> }) {
  const resolvedParams = await params as { id?: string } | undefined;
  const id = resolvedParams?.id;
  if (!id) notFound();
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'PATIENT') redirect('/login');
  const userId = (session.user as any).id;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { 
      patient: true, 
      doctor: { include: { user: true, department: true } }, 
      payments: true,
      labOrders: true,
      prescription: { include: { items: { include: { medicine: true } } } },
    }
  });

  if (!appointment) return <div style={{ padding: '2rem' }}>Không tìm thấy lịch hẹn.</div>;
  if (appointment.patientId !== userId) return <div style={{ padding: '2rem' }}>Bạn không có quyền truy cập trang này.</div>;

  // Breakdown Calculation
  const isBHYT = appointment.type === 'BHYT';
  
  const registrationFee = 10000;
  const consultationFee = appointment.doctor.consultationFee ?? 200000;
  
  const labOrders = appointment.labOrders || [];
  const labTotal = labOrders.reduce((sum, order) => sum + (order.price || 0), 0);

  const medicines = appointment.prescription?.items || [];
  const medicineTotal = medicines.reduce((sum, item) => sum + ((item.medicine?.price || 0) * item.quantity), 0);

  const subTotal = registrationFee + consultationFee + labTotal + medicineTotal;

  // BHYT discount applies to consultation, lab, and medicine (registration fee is often not covered)
  const discountableAmount = consultationFee + labTotal + medicineTotal;
  const bhytDiscount = isBHYT ? discountableAmount * 0.8 : 0; // 80% coverage
  
  const calculatedTotal = subTotal - bhytDiscount;

  // Prefer existing payment amount if payment was already initiated/paid
  const paidPayment = appointment.payments?.find(p => p.status === 'PAID');
  const pendingPayment = appointment.payments?.find(p => p.status === 'PENDING');
  const existingPayment = paidPayment ?? pendingPayment ?? undefined;
  
  const finalAmount = existingPayment?.amount ?? calculatedTotal;
  const paymentStatus = existingPayment?.status ?? 'NONE';

  const hospitalBankKey = 'vib-397435692-compact2.png';
  const qrInfo = encodeURIComponent(`Thanh toan vien phi ${appointment.patient?.name ?? 'BN'} - ${appointment.id.slice(-6).toUpperCase()}`);
  const vietQrUrl = `https://img.vietqr.io/image/${hospitalBankKey}?amount=${Math.round(finalAmount)}&addInfo=${qrInfo}&accountName=BENHVIEN%20HUNG%20LOI`;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
          💳
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>Thanh toán viện phí</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Mã hồ sơ: <span style={{ fontWeight: 600, color: '#334155' }}>{appointment.id.toUpperCase()}</span></p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Invoice Breakdown */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
          
          <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Bảng kê chi tiết</div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>BS. {appointment.doctor.user.name} - {appointment.doctor.department?.name || 'Phòng khám'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-block',
                  background: paymentStatus === 'PAID' ? '#dcfce7' : paymentStatus === 'PENDING' ? '#fef3c7' : '#f1f5f9',
                  color: paymentStatus === 'PAID' ? '#166534' : paymentStatus === 'PENDING' ? '#92400e' : '#475569'
                }}>
                  {paymentStatus === 'PAID' ? '✓ ĐÃ THANH TOÁN' : paymentStatus === 'PENDING' ? '⏳ CHỜ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ textAlign: 'left', padding: '1rem 0', fontWeight: 600 }}>Nội dung dịch vụ</th>
                  <th style={{ textAlign: 'center', padding: '1rem 0', width: '60px', fontWeight: 600 }}>SL</th>
                  <th style={{ textAlign: 'right', padding: '1rem 0', width: '120px', fontWeight: 600 }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.95rem' }}>
                
                {/* Hành chính & Khám bệnh */}
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>Phí đăng ký dịch vụ</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sổ khám bệnh, sổ y bạ</div>
                  </td>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>1</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#334155' }}>{registrationFee.toLocaleString('vi-VN')}₫</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>Công khám chuyên khoa</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Khám {isBHYT ? 'BHYT' : 'Dịch vụ'}</div>
                  </td>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>1</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#334155' }}>{consultationFee.toLocaleString('vi-VN')}₫</td>
                </tr>

                {/* Xét nghiệm */}
                {labOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 0' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.type}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Khoa xét nghiệm & Chẩn đoán hình ảnh</div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>1</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#334155' }}>{(order.price || 0).toLocaleString('vi-VN')}₫</td>
                  </tr>
                ))}

                {/* Thuốc men */}
                {medicines.map(med => (
                  <tr key={med.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 0' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{med.medicine.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{med.dosage} - {med.duration}</div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{med.quantity} {med.medicine.unit}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#334155' }}>{(med.medicine.price * med.quantity).toLocaleString('vi-VN')}₫</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Subtotal & Discounts */}
            <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Cộng khoản</span>
                <span>{subTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              
              {isBHYT && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                  <span>BHYT chi trả (80%)</span>
                  <span>-{bhytDiscount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#0f172a', color: 'white', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tổng thanh toán</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{finalAmount.toLocaleString('vi-VN')}₫</div>
          </div>
        </div>

        {/* Right Column: Actions & QR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Thanh toán trực tuyến</div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>Hỗ trợ VNPay, thẻ ATM, thẻ tín dụng và ví điện tử.</p>
            
            {/* @ts-ignore-next-line */}
            <PayClient appointmentId={appointment.id} initialAmount={finalAmount} paymentExists={!!existingPayment} paymentStatus={paymentStatus} />
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Chuyển khoản QR</div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>Mở ứng dụng ngân hàng và quét mã để thanh toán nhanh.</p>
            
            <div style={{ display: 'inline-block', padding: '8px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
              <img src={vietQrUrl} alt="VietQR Bệnh viện" style={{ width: '200px', height: '200px', display: 'block', borderRadius: '8px' }} />
            </div>
            <div style={{ fontWeight: 800, color: '#0a2d6e', fontSize: '1.1rem' }}>VIB - 397435692</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Bệnh viện Đa khoa Hưng Lợi</div>
          </div>

          <a href={`/print/invoice/${appointment.invoices?.[0]?.id || appointment.id}`} target="_blank" rel="noreferrer" style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '1rem', background: 'white', color: '#334155', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.2s' 
          }}>
            🖨️ In bảng kê điện tử
          </a>

        </div>

      </div>
    </div>
  );
}
