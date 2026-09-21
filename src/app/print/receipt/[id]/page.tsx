import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/PrintButton';

export default async function PrintReceipt({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const payment = await prisma.payment.findFirst({
    where: { appointmentId: id },
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: { include: { department: true } }
        }
      }
    }
  });

  if (!payment) notFound();

  const appt = payment.appointment;
  const isBHYT = appt?.type === 'BHYT';

  // If invoice exists, load itemized invoice; otherwise fall back to older dummy logic
  let invoice = null;
  if (payment.invoiceId) {
    invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId }, include: { items: true } });
  }

  // If we have an invoice with items, use them; otherwise synthesize items (consultation + other)
  let items: { description: string; amount: number; quantity: number }[] = [];
  let totalAmount = 0;

  if (invoice && invoice.items && invoice.items.length) {
    items = invoice.items.map(i => ({ description: i.description, amount: i.amount, quantity: i.quantity }));
    totalAmount = invoice.total ?? items.reduce((s, it) => s + it.amount * it.quantity, 0);
  } else {
    const examFee = isBHYT ? 50000 : 200000;
    const paymentAmt = payment.amount ?? 0;
    const otherFees = Math.max(0, paymentAmt - examFee);
    items.push({ description: `Công khám bệnh (${isBHYT ? 'Theo mức BHYT' : 'Dịch vụ'})`, amount: examFee, quantity: 1 });
    if (otherFees > 0) items.push({ description: 'Tiền thuốc và các xét nghiệm khác', amount: otherFees, quantity: 1 });
    totalAmount = paymentAmt;
  }

  // helper: number to Vietnamese words (handles integers up to billions)
  function numberToVietnamese(n: number) {
    if (n === 0) return 'không';
    const so = ['','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
    const dv = ['','mươi','trăm',''];

    const readHundreds = (num: number) => {
      const a = Math.floor(num / 100);
      const b = Math.floor((num % 100) / 10);
      const c = num % 10;
      let s = '';
      if (a) s += so[a] + ' trăm';
      if (b) s += (s ? ' ' : '') + so[b] + ' mươi';
      if (b === 0 && a && c) s += (s ? ' lẻ ' : '') + so[c];
      if (b === 1) s = s.replace('một mươi','mười');
      if (c === 1 && b > 1) s = s.replace('mươi một','mươi mốt');
      if (c === 5 && b >= 1) s = s.replace('năm','lăm');
      return s;
    };

    const parts: string[] = [];
    const units = ['', ' nghìn', ' triệu', ' tỷ'];
    let i = 0;
    while (n > 0) {
      const chunk = n % 1000;
      if (chunk) parts.unshift(readHundreds(chunk) + units[i]);
      n = Math.floor(n / 1000);
      i++;
    }
    return parts.join(' ').replace(/\s+/g,' ').trim();
  }

  const amountInWords = numberToVietnamese(Math.round(totalAmount));

  // Build VietQR image url (optional) — use hospital's bank (example: VIB 397435692)
  const hospitalBankKey = 'vib-397435692-compact2.png';
  const qrInfo = encodeURIComponent(`Thanh toan vien phi ${appt?.patient?.name ?? 'BN'} - ${payment.id.slice(-6).toUpperCase()}`);
  const vietQrUrl = `https://img.vietqr.io/image/${hospitalBankKey}?amount=${Math.round(totalAmount)}&addInfo=${qrInfo}&accountName=BENHVIEN%20HUNG%20LOI`;

  return (
    <div style={{ backgroundColor: '#e2e8f0', minHeight: '100vh', padding: '2rem 0', fontFamily: 'Arial, sans-serif' }}>
      <div className="print-area" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', margin: '0 auto', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '24px' }}>BỆNH VIỆN ĐA KHOA HƯNG LỢI</h2>
            <p style={{ margin: '5px 0 0', fontSize: '14px' }}>Địa chỉ: 123 Đường Y Tế, Quận 1, TP.HCM</p>
            <p style={{ margin: '5px 0 0', fontSize: '14px' }}>Mã số thuế: 0123456789</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic' }}>Số phiếu: {payment.id.slice(-6).toUpperCase()}</p>
            <p style={{ margin: '5px 0 0', fontSize: '14px' }}>Ngày lập: {new Intl.DateTimeFormat('vi-VN').format(new Date(payment.createdAt))}</p>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ textAlign: 'center', fontSize: '24px', margin: '12px 0 20px', textTransform: 'uppercase' }}>
          BIÊN LAI THU TIỀN VIỆN PHÍ
        </h1>

        {/* Patient Info */}
        <div style={{ marginBottom: '20px', fontSize: '15px', lineHeight: '1.5' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
            <p style={{ margin: '5px 0' }}><strong>Họ và tên người bệnh:</strong> {appt?.patient?.name ?? '—'}</p>
            <p style={{ margin: '5px 0' }}><strong>Hình thức khám:</strong> {isBHYT ? 'BHYT' : 'Dịch vụ'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
            <p style={{ margin: '5px 0' }}><strong>Số thẻ BHYT:</strong> {appt?.healthInsuranceNo || 'Không có'}</p>
            <p style={{ margin: '5px 0' }}><strong>Khoa:</strong> {appt?.doctor?.department?.name || 'Khám bệnh'}</p>
          </div>
        </div>

        {/* Payment Details */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>STT</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Nội dung thu</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Thành tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>{it.description}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(it.amount * (it.quantity||1)).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>TỔNG CỘNG:</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{totalAmount.toLocaleString('vi-VN')}</td>
            </tr>
          </tbody>
        </table>
        
        <p style={{ margin: '5px 0 12px', fontSize: '14px' }}><strong>Số tiền bằng chữ:</strong> <em>{amountInWords} đồng chẵn</em></p>

        {/* Payment methods */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginTop: '12px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '6px 0', fontSize: '16px' }}>Hình thức thanh toán</h3>
            <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '14px' }}>
              <li><strong>Thanh toán trực tiếp:</strong> Khách hàng nộp tiền tại quầy tiếp nhận khi đến khám hoặc nhận thuốc.</li>
              <li style={{ marginTop: '6px' }}><strong>Chuyển khoản / QR:</strong> Chuyển khoản vào tài khoản của Bệnh viện hoặc quét mã QR bên cạnh (VietQR).</li>
            </ul>

            <div style={{ marginTop: '12px', fontSize: '13px' }}>
              <p style={{ margin: '4px 0' }}><strong>Ngân hàng:</strong> VIB</p>
              <p style={{ margin: '4px 0' }}><strong>Chủ tài khoản:</strong> BỆNH VIỆN HƯNG LỢI</p>
              <p style={{ margin: '4px 0' }}><strong>Số tài khoản:</strong> 397435692</p>
              <p style={{ margin: '4px 0' }}><strong>Nội dung chuyển khoản:</strong> Thanh toan {payment.id.slice(-6).toUpperCase()} - {appt?.patient?.name ?? '—'}</p>
            </div>
          </div>

          <div style={{ width: '220px', textAlign: 'center' }}>
            <h4 style={{ margin: '6px 0', fontSize: '14px' }}>Quét mã để thanh toán</h4>
            <img src={vietQrUrl} alt="VietQR" style={{ width: '200px', height: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <p style={{ fontSize: '12px', color: '#64748b' }}>VIB - Tài khoản: 397435692</p>
          </div>
        </div>

        {/* Signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '5px 0 60px', fontWeight: 'bold' }}>Người nộp tiền</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{appt?.patient?.name ?? '—'}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontStyle: 'italic' }}>Ngày {new Date(payment.createdAt).getDate()} tháng {new Date(payment.createdAt).getMonth() + 1} năm {new Date(payment.createdAt).getFullYear()}</p>
            <p style={{ margin: '5px 0 60px', fontWeight: 'bold' }}>Người thu tiền (Kế toán)</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>BỆNH VIỆN ĐA KHOA HƯNG LỢI</p>
          </div>
        </div>

      </div>

      <PrintButton />
    </div>
  );
}
