import Link from 'next/link';

export default function InpatientPage() {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.5rem', marginBottom: '2rem' }}>Nội quy khu nội trú</h1>
      <div className="glass" style={{ padding: '3rem', borderRadius: '12px' }}>
        <p style={{ marginBottom: '2rem', fontWeight: 600 }}>Để đảm bảo môi trường điều trị tốt nhất cho người bệnh, xin vui lòng tuân thủ các quy định sau:</p>
        
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '2', marginBottom: '2rem' }}>
          <li><strong>Giờ thăm bệnh:</strong> Sáng từ 6:00 - 7:30, Trưa từ 11:30 - 13:00, Chiều từ 16:00 - 21:00. Mỗi bệnh nhân chỉ được tối đa 1 người nhà ở lại nuôi bệnh.</li>
          <li><strong>Vệ sinh - An ninh:</strong> Không hút thuốc lá trong khuôn viên bệnh viện. Không mang các vật dụng dễ cháy nổ, vũ khí vào phòng bệnh. Giữ gìn vệ sinh chung, bỏ rác đúng nơi quy định.</li>
          <li><strong>Tuân thủ phác đồ:</strong> Bệnh nhân và người nhà cần tuân thủ tuyệt đối các y lệnh của Bác sĩ và Điều dưỡng. Không tự ý sử dụng các loại thuốc mang từ ngoài vào.</li>
          <li><strong>Tài sản cá nhân:</strong> Bệnh nhân và người nhà tự bảo quản tài sản, tư trang cá nhân. Bệnh viện không chịu trách nhiệm nếu xảy ra mất mát tài sản.</li>
        </ul>
        
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
