import Link from 'next/link';

export const metadata = {
  title: 'Bảng giá dịch vụ - Bệnh Viện Đa Khoa Hưng Lợi',
  description: 'Bảng giá chi tiết các dịch vụ khám chữa bệnh tại Bệnh Viện Đa Khoa Hưng Lợi',
};

const pricingCategories = [
  {
    id: 'kham-benh',
    title: '1. Phí khám bệnh',
    icon: '🩺',
    items: [
      { name: 'Sổ khám bệnh / Đăng ký dịch vụ', price: '10.000', bhyt: 'Không' },
      { name: 'Khám chuyên khoa (Nội, Ngoại, Sản, Nhi)', price: '200.000', bhyt: 'Có (80%)' },
      { name: 'Khám chuyên gia / Giáo sư', price: '500.000', bhyt: 'Không' },
      { name: 'Khám cấp cứu', price: '300.000', bhyt: 'Có (80%)' },
      { name: 'Khám sức khỏe tổng quát (Cơ bản)', price: '1.500.000', bhyt: 'Không' },
    ]
  },
  {
    id: 'chan-doan-hinh-anh',
    title: '2. Chẩn đoán hình ảnh & Thăm dò chức năng',
    icon: '🩻',
    items: [
      { name: 'Siêu âm màu 4D', price: '250.000', bhyt: 'Có (80%)' },
      { name: 'Chụp X-Quang kỹ thuật số (1 tư thế)', price: '120.000', bhyt: 'Có (80%)' },
      { name: 'Chụp CT Scanner 256 lát cắt (Không cản quang)', price: '1.200.000', bhyt: 'Có (80%)' },
      { name: 'Chụp Cộng hưởng từ MRI 3.0 Tesla', price: '2.500.000', bhyt: 'Có (80%)' },
      { name: 'Đo điện tim (ECG)', price: '80.000', bhyt: 'Có (80%)' },
    ]
  },
  {
    id: 'xet-nghiem',
    title: '3. Xét nghiệm (Huyết học - Sinh hóa - Miễn dịch)',
    icon: '🔬',
    items: [
      { name: 'Tổng phân tích tế bào máu ngoại vi', price: '90.000', bhyt: 'Có (80%)' },
      { name: 'Xét nghiệm Sinh hóa máu (Đường huyết, Men gan, Thận)', price: '200.000', bhyt: 'Có (80%)' },
      { name: 'Xét nghiệm nước tiểu toàn phần', price: '60.000', bhyt: 'Có (80%)' },
      { name: 'Xét nghiệm Dấu ấn ung thư (AFP, CEA, PSA)', price: '350.000 / mốc', bhyt: 'Tùy BHYT' },
    ]
  },
  {
    id: 'noi-soi',
    title: '4. Nội soi Tiêu hóa',
    icon: '🔍',
    items: [
      { name: 'Nội soi dạ dày, tá tràng (Không gây mê)', price: '450.000', bhyt: 'Có (80%)' },
      { name: 'Nội soi dạ dày, tá tràng (Có gây mê)', price: '1.200.000', bhyt: 'Có (một phần)' },
      { name: 'Nội soi đại trực tràng (Không gây mê)', price: '800.000', bhyt: 'Có (80%)' },
      { name: 'Nội soi đại trực tràng (Có gây mê)', price: '1.800.000', bhyt: 'Có (một phần)' },
    ]
  },
  {
    id: 'giuong-benh',
    title: '5. Giá giường bệnh Nội trú (Tính theo ngày)',
    icon: '🛏️',
    items: [
      { name: 'Giường thường (Phòng 6 giường)', price: '200.000', bhyt: 'Có (80%)' },
      { name: 'Giường dịch vụ (Phòng 2 giường, máy lạnh, TV)', price: '600.000', bhyt: 'Có (Mức trần BHYT)' },
      { name: 'Phòng VIP (Phòng đơn, đầy đủ tiện nghi khách sạn)', price: '1.500.000', bhyt: 'Không' },
      { name: 'Phòng Hồi sức tích cực (ICU)', price: '800.000', bhyt: 'Có (80%)' },
    ]
  }
];

export default function PricingPage() {
  return (
    <div style={{ backgroundColor: '#f8faff', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #0a2d6e 0%, #1a56db 100%)', color: 'white', padding: '4rem 0 6rem 0', textAlign: 'center', position: 'relative' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Bảng Báo Giá Dịch Vụ Y Tế</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>
          Chi tiết bảng giá khám chữa bệnh công khai, minh bạch theo tiêu chuẩn Bộ Y tế. Các dịch vụ có áp dụng thanh toán Bảo hiểm Y tế (BHYT) được ghi chú rõ ràng.
        </p>
      </div>

      {/* CONTENT */}
      <div className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gap: '2rem' }}>
          {pricingCategories.map(cat => (
            <div key={cat.id} style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                background: '#f1f5f9',
                padding: '1.25rem 2rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{cat.title}</h2>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: '#fafbfc' }}>
                      <th style={{ padding: '1rem 2rem', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Tên dịch vụ</th>
                      <th style={{ padding: '1rem 2rem', textAlign: 'right', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0', width: '200px' }}>Đơn giá (VNĐ)</th>
                      <th style={{ padding: '1rem 2rem', textAlign: 'center', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0', width: '150px' }}>Áp dụng BHYT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: idx === cat.items.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background 0.2s' }} className="price-row">
                        <td style={{ padding: '1.25rem 2rem', fontWeight: 600, color: '#334155' }}>{item.name}</td>
                        <td style={{ padding: '1.25rem 2rem', textAlign: 'right', fontWeight: 800, color: '#0a2d6e', fontSize: '1.1rem' }}>{item.price}₫</td>
                        <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                            background: item.bhyt.includes('Không') ? '#fee2e2' : '#dcfce7',
                            color: item.bhyt.includes('Không') ? '#b91c1c' : '#15803d'
                          }}>
                            {item.bhyt}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '2rem', borderRadius: '16px', color: '#92400e', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '2rem' }}>💡</div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Lưu ý về Thanh toán Bảo Hiểm Y Tế (BHYT)</h3>
              <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Mức hưởng BHYT phụ thuộc vào đối tượng tham gia (ký hiệu trên thẻ BHYT) và tuyến khám chữa bệnh. Cụ thể mức hưởng đúng tuyến:</p>
              <ul style={{ paddingLeft: '1.2rem', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1rem' }}>
                <li><strong>Hưởng 100% chi phí:</strong> Sĩ quan, quân đội, công an, người có công với cách mạng, cựu chiến binh, trẻ em dưới 6 tuổi, người thuộc hộ nghèo.</li>
                <li><strong>Hưởng 95% chi phí:</strong> Người hưởng lương hưu, trợ cấp mất sức lao động, thân nhân người có công, người thuộc hộ cận nghèo.</li>
                <li><strong>Hưởng 80% chi phí:</strong> Các đối tượng còn lại (người lao động, học sinh - sinh viên, BHYT tự nguyện hộ gia đình).</li>
              </ul>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.9 }}>
                * Bệnh nhân khám trái tuyến mà không có giấy chuyển viện sẽ được hưởng mức thấp hơn theo quy định của Luật BHYT hiện hành. Thuốc men và vật tư y tế được tính theo giá trần của Bảo Hiểm Xã Hội.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .price-row:hover { background-color: #f8fafc; }
      `}</style>
    </div>
  );
}
