import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: '#020617', // Very dark slate/navy
      backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(26,86,219,0.1) 0%, transparent 40%), radial-gradient(circle at 0% 100%, rgba(0,198,162,0.08) 0%, transparent 40%)',
      color: 'white',
      paddingTop: '5rem',
      paddingBottom: '0',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.4fr', gap: '3rem', marginBottom: '4rem' }}>

          {/* Col 1: Info */}
          <div>
            {/* Logo + Tên */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'white', padding: '0.4rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="/clinic-logo.png"
                  alt="Logo Bệnh viện đa khoa Hưng Lợi"
                  style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0 }}
                />
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Bệnh viện đa khoa</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>HƯNG LỢI</div>
                <div style={{ fontSize: '0.68rem', color: '#00c6a2', fontWeight: 600, letterSpacing: '0.04em', marginTop: '1px' }}>CHĂM SÓC SỨC KHỎE TOÀN DIỆN</div>
              </div>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '0.88rem', marginBottom: '1.5rem', maxWidth: '300px' }}>
              Bệnh viện đa khoa hàng đầu TP.HCM với hơn 25 năm kinh nghiệm, đội ngũ 120+ bác sĩ chuyên gia và trang thiết bị hiện đại.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              {[
                { icon: '📍', text: '208 Nguyễn Hữu Cảnh, Vinhomes Tân Cảng, TP.HCM' },
                { icon: '🚑', text: 'Cấp cứu 24/7: 1900 1234' },
                { icon: '📞', text: 'Tư vấn: (028) 3812 3456' },
                { icon: '✉️', text: 'cskh@bvhungloi.vn' },
                { icon: '⏰', text: '6:00 - 16:00 (Thứ 2 - Thứ 6)' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', color: 'rgba(255,255,255,0.65)' }}>
                  <span style={{ flexShrink: 0, fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Về chúng tôi */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: 'white', position: 'relative', paddingBottom: '0.75rem' }}>
              Về Chúng Tôi
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '2px', background: '#00c6a2', borderRadius: '2px' }} />
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.88rem' }}>
              {[
                { href: '/about', label: 'Lịch sử hình thành' },
                { href: '/about', label: 'Tầm nhìn & Sứ mệnh' },
                { href: '/doctors', label: 'Đội ngũ Chuyên gia' },
                { href: '/news', label: 'Tin tức Bệnh viện' },
                { href: '/careers', label: 'Tuyển dụng' },
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="footer-link" style={{ color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ color: '#00c6a2', fontSize: '0.65rem' }}>▶</span> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Người bệnh */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: 'white', position: 'relative', paddingBottom: '0.75rem' }}>
              Dành Cho Người Bệnh
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '2px', background: '#00c6a2', borderRadius: '2px' }} />
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.88rem' }}>
              {[
                { href: '/booking', label: 'Đặt lịch khám trực tuyến' },
                { href: '/services', label: 'Bảng giá dịch vụ KCB' },
                { href: '/faq', label: 'Quy trình khám bệnh' },
                { href: '/inpatient', label: 'Nội quy nội trú' },
                { href: '/insurance', label: 'Quy định BHYT' },
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="footer-link" style={{ color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ color: '#00c6a2', fontSize: '0.65rem' }}>▶</span> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Map */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: 'white', position: 'relative', paddingBottom: '0.75rem' }}>
              Bản Đồ Chỉ Đường
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '2px', background: '#00c6a2', borderRadius: '2px' }} />
            </h4>
            <div style={{ width: '100%', height: '190px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(0,198,162,0.25)', marginBottom: '1rem' }}>
              {/* 208 Nguyễn Hữu Cảnh, Vinhomes Tân Cảng, TP.HCM */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.0579773804!2d106.7162!3d10.7929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752953c4e1dbf9%3A0xa59c5f41c7da1ae9!2s208%20Nguy%E1%BB%85n%20H%E1%BB%AFu%20C%E1%BA%A3nh%2C%20Th%E1%BA%A1nh%20M%E1%BB%B9%20T%C3%A2y%2C%20B%C3%ACnh%20Th%E1%BA%A1nh%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ Bệnh viện đa khoa Hưng Lợi"
              />
            </div>
            <a href="tel:19001234" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              padding: '0.8rem 1rem', borderRadius: '12px',
              background: 'linear-gradient(135deg, #00c6a2 0%, #009e82 100%)',
              color: 'white', fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,198,162,0.3)',
              transition: 'transform 0.2s ease',
            }}>
              📞 Gọi ngay: 1900 1234
            </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1.5rem 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'rgba(255,255,255,0.4)',
        }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Bệnh Viện Đa Khoa Hưng Lợi. Cơ quan chủ quản: Sở Y tế TP.HCM.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', marginRight: '1.5rem' }}>
              {['Facebook', 'YouTube', 'Zalo'].map((s, i) => (
                <Link key={i} href="/" style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', fontSize: '0.82rem', fontWeight: 600 }} className="footer-link">
                  {s}
                </Link>
              ))}
            </div>
            {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Sơ đồ site'].map((t, i) => (
              <Link key={i} href="/" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }} className="footer-link">{t}</Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: #00c6a2 !important; }
      `}</style>
    </footer>
  );
}
