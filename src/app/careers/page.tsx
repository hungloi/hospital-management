import Link from 'next/link';

export default function CareersPage() {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.5rem', marginBottom: '2rem' }}>Tuyển dụng</h1>
      <div className="glass" style={{ padding: '3rem', borderRadius: '12px' }}>
        <p style={{ marginBottom: '2rem' }}>Bệnh viện Hưng Lợi luôn chào đón những nhân tài y khoa, các chuyên gia, bác sĩ, điều dưỡng và nhân viên y tế tận tâm gia nhập đội ngũ của chúng tôi.</p>
        
        <div style={{ backgroundColor: 'var(--primary-light)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary-dark)', marginBottom: '1rem' }}>Các vị trí đang mở:</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
            <li>Bác sĩ chuyên khoa Nội/Ngoại (Số lượng: 02)</li>
            <li>Điều dưỡng viên (Số lượng: 05)</li>
            <li>Chuyên viên CSKH (Số lượng: 03)</li>
          </ul>
        </div>
        
        <p>Vui lòng gửi CV và hồ sơ về địa chỉ email: <strong>tuyendung@bvhungloi.vn</strong></p>
        
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
