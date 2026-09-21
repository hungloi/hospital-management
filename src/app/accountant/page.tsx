'use client';
import { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { ACCOUNTANT_THEME } from '@/lib/adminConfig';

const ACCOUNTANT_NAV = [
  { href: '/accountant', icon: '💳', label: 'Tạo phiếu thu & QR' },
  { href: '/accountant/history', icon: '📝', label: 'Lịch sử giao dịch' },
  { href: '/accountant/insurance', icon: '🏥', label: 'Thanh toán BHYT' },
  { href: '/accountant/reports', icon: '📊', label: 'Báo cáo doanh thu' },
];

const FOOTER = <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#ede9fe', borderRadius: '8px', color: '#8b5cf6', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>TÀI CHÍNH KẾ TOÁN</div>;

export default function AccountantDashboard() {
  const [patientName, setPatientName] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('Phiếu khám bệnh');
  const [qrUrl, setQrUrl] = useState('');

  const generateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !amount) return alert('Vui lòng nhập đủ thông tin!');
    
    // VietQR Format
    // Bank: Vietcombank (vcb)
    // Account: 123456789 (Demo)
    // Template: compact2
    const cleanAmount = amount.replace(/\D/g, '');
    const info = `Thanh toan vien phi ${patientName}`;
    const url = `https://img.vietqr.io/image/vib-397435692-compact2.png?amount=${cleanAmount}&addInfo=${encodeURIComponent(info)}&accountName=TRINH%20HUNG%20LOI`;
    
    setQrUrl(url);
  };

  const printBill = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>In Phiếu Thu</title></head>
      <body style="font-family: sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; text-align: center;">
        <h2>BỆNH VIỆN ĐA KHOA HƯNG LỢI</h2>
        <h3>PHIẾU THU VIỆN PHÍ</h3>
        <p style="text-align: left;"><strong>Khách hàng:</strong> ${patientName}</p>
        <p style="text-align: left;"><strong>Nội dung:</strong> ${reason}</p>
        <p style="text-align: left;"><strong>Số tiền:</strong> ${parseInt(amount.replace(/\D/g, '') || '0').toLocaleString('vi-VN')} VNĐ</p>
        <hr style="margin: 20px 0;" />
        <p>Quét mã QR để thanh toán (VietQR)</p>
        <img src="${qrUrl}" style="width: 100%; max-width: 300px;" />
        <p style="margin-top: 20px;">Cảm ơn quý khách!</p>
        <script>setTimeout(() => window.print(), 1000);</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <DashboardShell title="Phòng Tài chính Kế toán" subtitle="Tạo phiếu thu" items={ACCOUNTANT_NAV} theme={ACCOUNTANT_THEME} >
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Tạo Hóa đơn & QR Thanh toán</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Form */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#334155' }}>Thông tin Hóa đơn</h2>
            <form onSubmit={generateQR} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Tên người bệnh</label>
                <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Nhập tên người nộp tiền" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Lý do nộp</label>
                <select value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option>Phiếu khám bệnh</option>
                  <option>Tiền thuốc</option>
                  <option>Tiền xét nghiệm / Cận lâm sàng</option>
                  <option>Tạm ứng viện phí nội trú</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' }}>Số tiền (VNĐ)</label>
                <input type="text" value={amount} onChange={e => setAmount(e.target.value)} placeholder="VD: 500000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </div>
              <button type="submit" style={{ padding: '1rem', background: '#8b5cf6', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, marginTop: '1rem', cursor: 'pointer' }}>
                Tạo mã QR Thanh toán
              </button>
            </form>
          </div>

          {/* QR Preview */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {qrUrl ? (
              <>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#10b981' }}>Mã QR Đã sẵn sàng</h2>
                <img src={qrUrl} alt="VietQR" style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <button onClick={printBill} style={{ padding: '0.75rem 2rem', background: '#10b981', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, marginTop: '1.5rem', cursor: 'pointer' }}>
                  🖨️ In Hóa đơn
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                <p>Mã QR sẽ hiển thị tại đây</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

