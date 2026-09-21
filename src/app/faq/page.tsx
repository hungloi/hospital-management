import Link from 'next/link';

export default function FAQPage() {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.5rem', marginBottom: '2rem' }}>Hướng dẫn quy trình khám bệnh</h1>
      <div className="glass" style={{ padding: '3rem', borderRadius: '12px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Bước 1: Đăng ký khám</h3>
          <p>Người bệnh đăng ký khám trực tuyến qua website hoặc đến trực tiếp quầy tiếp nhận. Lấy số thứ tự và thanh toán phí khám (nếu khám dịch vụ).</p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Bước 2: Khám lâm sàng</h3>
          <p>Đến phòng khám theo số thứ tự hiển thị trên màn hình. Bác sĩ sẽ thăm khám và chỉ định cận lâm sàng (nếu cần).</p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Bước 3: Thực hiện cận lâm sàng</h3>
          <p>Thanh toán phí cận lâm sàng (xét nghiệm, siêu âm, X-quang,...) và tiến hành thực hiện tại các phòng chức năng.</p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Bước 4: Nhận kết quả và toa thuốc</h3>
          <p>Mang kết quả quay lại phòng khám ban đầu. Bác sĩ kết luận, kê toa thuốc. Người bệnh thanh toán và nhận thuốc tại Quầy Dược.</p>
        </div>

        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          <Link href="/booking" style={{
            display: 'inline-block',
            backgroundColor: 'var(--primary-color)',
            color: 'white', padding: '0.8rem 1.5rem',
            borderRadius: '4px', fontWeight: 600, textDecoration: 'none'
          }}>
            Đặt lịch khám ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
