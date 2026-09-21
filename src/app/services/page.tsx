import Link from 'next/link';

export const metadata = {
  title: 'Dịch vụ & Bảng giá - Bệnh Viện Đa Khoa Hưng Lợi',
  description: 'Các dịch vụ y tế chất lượng cao tại Bệnh Viện Đa Khoa Hưng Lợi',
};

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      icon: '🏥',
      title: 'Khám Chuyên Khoa',
      description: 'Dịch vụ khám bệnh chuyên sâu với đội ngũ chuyên gia đầu ngành trong các lĩnh vực Nội, Ngoại, Sản, Nhi.',
      features: ['Khám với PGS, TS', 'Không chờ đợi', 'Phòng khám riêng tư'],
      color: 'from-blue-600 to-blue-400'
    },
    {
      id: 2,
      icon: '🔬',
      title: 'Xét Nghiệm Kỹ Thuật Cao',
      description: 'Hệ thống phòng Lab hiện đại, tự động hoàn toàn giúp đưa ra kết quả xét nghiệm nhanh chóng và chính xác tuyệt đối.',
      features: ['Sinh hóa - Miễn dịch', 'Huyết học', 'Sinh học phân tử'],
      color: 'from-teal-500 to-emerald-400'
    },
    {
      id: 3,
      icon: '🩻',
      title: 'Chẩn Đoán Hình Ảnh',
      description: 'Trang bị máy MRI 3.0 Tesla, CT Scanner 256 lát cắt, X-Quang kỹ thuật số thế hệ mới nhất.',
      features: ['Siêu âm 4D/5D', 'Chụp MRI không tiếng ồn', 'X-quang liều thấp'],
      color: 'from-indigo-600 to-indigo-400'
    },
    {
      id: 4,
      icon: '💉',
      title: 'Tiêm Chủng Trọn Gói',
      description: 'Dịch vụ tiêm chủng an toàn cho trẻ em và người lớn với các loại vắc-xin thế hệ mới, bảo quản chuẩn GSP.',
      features: ['Vắc-xin ngoại nhập', 'Khám sàng lọc miễn phí', 'Nhắc lịch tiêm tự động'],
      color: 'from-rose-500 to-pink-400'
    },
    {
      id: 5,
      icon: '📋',
      title: 'Tầm Soát Ung Thư',
      description: 'Các gói tầm soát ung thư toàn diện ứng dụng trí tuệ nhân tạo (AI) giúp phát hiện mầm mống ung thư từ giai đoạn rất sớm.',
      features: ['Gói cơ bản - nâng cao', 'Tư vấn cá nhân hóa', 'Bảo mật hồ sơ'],
      color: 'from-amber-500 to-orange-400'
    },
    {
      id: 6,
      icon: '🚑',
      title: 'Cấp Cứu 24/7',
      description: 'Đội ngũ cấp cứu phản ứng nhanh, hoạt động 24/7 sẵn sàng hỗ trợ bệnh nhân trong tình trạng khẩn cấp.',
      features: ['Xe cứu thương ICU', 'Can thiệp tim mạch cấp', 'Trực thăng y tế'],
      color: 'from-red-600 to-red-500'
    }
  ];

  const vipPackages = [
    {
      name: 'Gói Khám VIP Thượng Lưu',
      price: '15.000.000đ',
      desc: 'Trải nghiệm chăm sóc sức khỏe đẳng cấp 5 sao dành cho khách hàng VVIP.',
      items: [
        'Đưa đón bằng xe siêu sang',
        'Khám tại khu vực VVIP riêng biệt',
        'Hội chẩn cùng hội đồng chuyên môn',
        'Phòng nghỉ ngơi chuẩn khách sạn 5 sao',
        'Phục vụ ẩm thực theo chế độ dinh dưỡng'
      ],
      img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Gói Thai Sản Kim Cương',
      price: '45.000.000đ',
      desc: 'Hành trình vượt cạn an toàn, nhẹ nhàng và trọn vẹn yêu thương.',
      items: [
        'Chọn bác sĩ mổ/đỡ đẻ',
        'Phòng nội trú Tổng thống (Presidential Suite)',
        'Chiếu tia plasma mau lành vết thương',
        'Tắm bé và massage mẹ tại nhà',
        'Lưu trữ tế bào gốc máu cuống rốn'
      ],
      img: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div style={{ backgroundColor: '#f8faff', minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <section style={{
        background: '#f0f4f8',
        padding: '6rem 0',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,198,162,0.2) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            Chất lượng quốc tế
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Dịch Vụ Y Tế Đỉnh Cao
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
            Hệ sinh thái chăm sóc sức khỏe toàn diện với tiêu chuẩn chất lượng JCI quốc tế. Chúng tôi cam kết mang lại trải nghiệm y tế an toàn, chính xác và đẳng cấp.
          </p>
        </div>
      </section>

      {/* CORE SERVICES */}
      <section className="container" style={{ padding: '6rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0a2d6e', marginBottom: '1rem' }}>Các Dịch Vụ Tiêu Biểu</h2>
          <div style={{ width: '80px', height: '4px', background: 'linear-gradient(90deg, #1a56db, #00c6a2)', margin: '0 auto', borderRadius: '2px' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {services.map((svc) => (
            <div key={svc.id} className="service-card" style={{
              background: 'white',
              borderRadius: '24px',
              padding: '2.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.03)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: '1.5rem',
                width: '72px', height: '72px',
                borderRadius: '20px',
                background: 'rgba(26,86,219,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {svc.icon}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0a1628', marginBottom: '1rem' }}>{svc.title}</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.95rem' }}>{svc.description}</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                {svc.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#334155', fontSize: '0.9rem', fontWeight: 500 }}>
                    <span style={{ color: '#00c6a2' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* VIP PACKAGES */}
      <section style={{ backgroundColor: '#0a1628', padding: '6rem 0', color: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              VIP & Signature
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Đặc Quyền Thượng Lưu</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>Trải nghiệm dịch vụ y tế đẳng cấp quốc tế kết hợp nghỉ dưỡng cao cấp.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem' }}>
            {vipPackages.map((pkg, idx) => (
              <div key={idx} style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  height: '220px',
                  backgroundImage: `url(${pkg.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  {/* Dark overlay for text readability if needed */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a1628 0%, transparent 100%)' }}></div>
                </div>
                
                <div style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d4af37', marginBottom: '0.5rem' }}>{pkg.name}</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>{pkg.price}</div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '2rem' }}>{pkg.desc}</p>
                  
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', flex: 1 }}>
                    {pkg.items.map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#475569' }}>
                        <span style={{ color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)' }}>✦</span> 
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link href="/booking?type=VIP" className="vip-btn" style={{
                    display: 'block', width: '100%', textAlign: 'center',
                    background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                    color: '#000', fontWeight: 800, fontSize: '1.1rem',
                    padding: '1.2rem', borderRadius: '14px', textDecoration: 'none',
                    boxShadow: '0 10px 20px rgba(212,175,55,0.2)',
                    transition: 'transform 0.2s',
                    marginTop: 'auto'
                  }}>
                    Đăng Ký Khám Ưu Tiên
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div style={{ background: 'white', borderRadius: '32px', padding: '5rem 2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '30%', height: '120%', background: 'linear-gradient(90deg, rgba(26,86,219,0.05) 0%, transparent 100%)', transform: 'skewX(-15deg)' }}></div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0a1628', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>Sẵn sàng chăm sóc sức khỏe của bạn?</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem auto', position: 'relative', zIndex: 1 }}>Hãy đặt lịch hẹn ngay hôm nay để trải nghiệm dịch vụ y tế chuẩn quốc tế cùng đội ngũ chuyên gia hàng đầu.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            <Link href="/booking" style={{
              background: 'linear-gradient(135deg, #1a56db 0%, #0952d1 100%)',
              color: 'white', fontWeight: 700, padding: '1rem 2.5rem', borderRadius: '40px', fontSize: '1.1rem',
              textDecoration: 'none', boxShadow: '0 10px 25px rgba(26,86,219,0.3)',
              transition: 'all 0.2s'
            }}>
              Đặt Lịch Khám
            </Link>
            <a href="tel:19001234" style={{
              background: '#f1f5f9',
              color: '#0f172a', fontWeight: 700, padding: '1rem 2.5rem', borderRadius: '40px', fontSize: '1.1rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              border: '1px solid #e2e8f0'
            }}>
              📞 Gọi 1900 1234
            </a>
          </div>
        </div>
      </section>

      <style>{`
        .service-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 50px rgba(26,86,219,0.1) !important;
          border-color: rgba(26,86,219,0.1) !important;
        }
        .vip-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
