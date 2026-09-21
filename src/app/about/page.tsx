import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.5rem', marginBottom: '2rem' }}>Lịch sử hình thành</h1>
      <div className="glass" style={{ padding: '3rem', borderRadius: '12px' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Hơn 10 năm đồng hành cùng sức khỏe cộng đồng</h2>
        <p style={{ marginBottom: '1rem' }}>Bệnh viện Đa khoa Hưng Lợi được thành lập với mục tiêu mang đến dịch vụ y tế chất lượng cao, an toàn và tận tâm cho mọi bệnh nhân. Trải qua nhiều năm phát triển, chúng tôi đã vươn lên trở thành một trong những cơ sở y tế hàng đầu khu vực.</p>
        <p style={{ marginBottom: '1rem' }}>Với hệ thống cơ sở vật chất khang trang, trang thiết bị hiện đại cùng đội ngũ chuyên gia, y bác sĩ đầu ngành, Bệnh viện Hưng Lợi tự hào đã cứu chữa và chăm sóc sức khỏe cho hàng triệu bệnh nhân.</p>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
