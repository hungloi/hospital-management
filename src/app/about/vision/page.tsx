import Link from 'next/link';

export default function VisionPage() {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.5rem', marginBottom: '2rem' }}>Tầm nhìn & Sứ mệnh</h1>
      <div className="glass" style={{ padding: '3rem', borderRadius: '12px' }}>
        <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.5rem', marginBottom: '1rem' }}>🎯 Tầm nhìn</h3>
        <p style={{ marginBottom: '2rem' }}>Trở thành Bệnh viện Đa khoa chuẩn quốc tế hàng đầu tại Việt Nam, là lựa chọn ưu tiên của người dân trong và ngoài nước khi có nhu cầu chăm sóc sức khỏe.</p>
        
        <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.5rem', marginBottom: '1rem' }}>❤️ Sứ mệnh</h3>
        <p style={{ marginBottom: '1rem' }}>Cung cấp dịch vụ khám chữa bệnh chất lượng cao, an toàn, hiệu quả với chi phí hợp lý.</p>
        <p style={{ marginBottom: '2rem' }}>Xây dựng môi trường y tế thân thiện, tôn trọng và thấu hiểu người bệnh. Không ngừng nghiên cứu, ứng dụng kỹ thuật y khoa tiên tiến.</p>

        <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.5rem', marginBottom: '1rem' }}>⭐ Giá trị cốt lõi</h3>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', lineHeight: '1.8' }}>
          <li><strong>Y đức:</strong> Lấy người bệnh làm trung tâm, tận tâm phục vụ.</li>
          <li><strong>Chuyên nghiệp:</strong> Đội ngũ giỏi chuyên môn, chuẩn mực trong giao tiếp.</li>
          <li><strong>Đổi mới:</strong> Luôn cập nhật kiến thức và công nghệ y khoa mới nhất.</li>
        </ul>

        <div style={{ marginTop: '2rem' }}>
          <Link href="/" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
