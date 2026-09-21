import Link from 'next/link';

export default function InsurancePage() {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.5rem', marginBottom: '2rem' }}>Quy định Bảo hiểm Y tế (BHYT)</h1>
      <div className="glass" style={{ padding: '3rem', borderRadius: '12px' }}>
        <p style={{ marginBottom: '2rem' }}>Bệnh viện Hưng Lợi chấp nhận thanh toán thẻ BHYT thông tuyến toàn quốc cho mọi trường hợp khám chữa bệnh Ngoại trú và Nội trú theo quy định của Luật Bảo hiểm Y tế.</p>
        
        <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.3rem', marginBottom: '1rem' }}>Giấy tờ cần mang theo:</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '2', marginBottom: '2rem' }}>
          <li>Thẻ BHYT (bản cứng) hoặc hình ảnh thẻ BHYT trên ứng dụng VssID còn hạn sử dụng.</li>
          <li>Giấy tờ tùy thân có ảnh hợp lệ (CCCD, CMND, Hộ chiếu). Trẻ em dưới 6 tuổi cần mang Giấy khai sinh.</li>
          <li>Giấy chuyển tuyến hợp lệ (nếu khám trái tuyến hoặc vượt tuyến cần hưởng mức cao nhất).</li>
        </ul>

        <h3 style={{ color: 'var(--secondary-color)', fontSize: '1.3rem', marginBottom: '1rem' }}>Mức hưởng BHYT tham khảo:</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '2', marginBottom: '2rem' }}>
          <li><strong>Đúng tuyến:</strong> Hưởng 80% - 100% chi phí trong danh mục tùy thuộc vào mã đối tượng trên thẻ.</li>
          <li><strong>Trái tuyến (Điều trị Nội trú):</strong> Hưởng 100% chi phí nội trú theo mức hưởng đúng tuyến (thông tuyến tỉnh).</li>
          <li><strong>Trái tuyến (Khám Ngoại trú):</strong> Người bệnh tự chi trả 100% chi phí khám ngoại trú.</li>
        </ul>
        
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
