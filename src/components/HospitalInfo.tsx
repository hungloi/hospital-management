'use client';
import Link from 'next/link';
import styles from '@/app/page.module.css';
import { MOCK_NEWS } from '@/data/mockNews';

const SPECIALTIES = [
  { icon: '🫀', title: 'Tim mạch', desc: 'Chẩn đoán và điều trị bệnh tim mạch', color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)' },
  { icon: '🧠', title: 'Thần kinh', desc: 'Điều trị bệnh lý hệ thần kinh', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  { icon: '🦷', title: 'Răng hàm mặt', desc: 'Nha khoa tổng quát & thẩm mỹ', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  { icon: '👁️', title: 'Nhãn khoa', desc: 'Khám và điều trị bệnh về mắt', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  { icon: '🦴', title: 'Cơ xương khớp', desc: 'Chỉnh hình và phục hồi chức năng', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { icon: '🫁', title: 'Hô hấp', desc: 'Điều trị bệnh phổi và đường hô hấp', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
];

const DOCTORS = [
  {
    name: 'BS. Nguyễn Văn Minh',
    title: 'Trưởng khoa Tim mạch',
    exp: '20 năm kinh nghiệm',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    rating: '4.9',
  },
  {
    name: 'BS. Trần Thị Lan',
    title: 'Chuyên gia Thần kinh',
    exp: '15 năm kinh nghiệm',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80',
    rating: '4.8',
  },
  {
    name: 'BS. Lê Quang Huy',
    title: 'Chuyên gia Nội khoa',
    exp: '18 năm kinh nghiệm',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    rating: '4.9',
  },
];



export default function HospitalInfo({ articles = [] }: { articles?: any[] }) {
  return (
    <>
      {/* === SPECIALTIES SECTION === */}
      <section className={styles.specialtiesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionBadge}>Chuyên khoa</span>
              <h2 className={styles.sectionTitle}>Dịch vụ y tế chuyên sâu</h2>
            </div>
            <p className={styles.sectionDesc}>
              30+ chuyên khoa với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại nhất
            </p>
          </div>

          <div className={styles.specialtiesGrid}>
            {SPECIALTIES.map((s, i) => (
              <Link key={i} href="/services" className={styles.specialtyCard} style={{ '--card-color': s.color, '--card-bg': s.bg } as React.CSSProperties}>
                <div className={styles.specialtyIconWrap} style={{ background: s.bg }}>
                  <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                </div>
                <h3 className={styles.specialtyTitle}>{s.title}</h3>
                <p className={styles.specialtyDesc}>{s.desc}</p>
                <span className={styles.specialtyArrow} style={{ color: s.color }}>→</span>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/services" className={styles.btnOutlineBlue}>
              Xem tất cả chuyên khoa →
            </Link>
          </div>
        </div>
      </section>

      {/* === STATS BANNER === */}
      <section className={styles.statsSection}>
        <div className={styles.statsBg} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.statsGrid}>
            {[
              { num: '50,000+', label: 'Bệnh nhân tin tưởng', icon: '🏥' },
              { num: '120+', label: 'Bác sĩ chuyên gia', icon: '👨‍⚕️' },
              { num: '98%', label: 'Hài lòng sau điều trị', icon: '⭐' },
              { num: '24/7', label: 'Cấp cứu luôn sẵn sàng', icon: '🚑' },
            ].map((s, i) => (
              <div key={i} className={styles.statItem}>
                <span className={styles.statItemIcon}>{s.icon}</span>
                <strong className={styles.statItemNum}>{s.num}</strong>
                <span className={styles.statItemLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === DOCTORS SECTION === */}
      <section className={styles.doctorsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionBadge}>Đội ngũ</span>
              <h2 className={styles.sectionTitle}>Bác sĩ nổi bật</h2>
            </div>
            <Link href="/doctors" className={styles.btnOutlineBlue}>Xem tất cả →</Link>
          </div>

          <div className={styles.doctorsGrid}>
            {DOCTORS.map((d, i) => (
              <div key={i} className={styles.doctorCard}>
                <div className={styles.doctorImgWrap}>
                  <img src={d.img} alt={d.name} className={styles.doctorImg} />
                  <div className={styles.doctorRating}>
                    ⭐ {d.rating}
                  </div>
                </div>
                <div className={styles.doctorInfo}>
                  <h3 className={styles.doctorName}>{d.name}</h3>
                  <p className={styles.doctorTitle}>{d.title}</p>
                  <p className={styles.doctorExp}>{d.exp}</p>
                  <Link href="/booking" className={styles.doctorBookBtn}>
                    Đặt lịch khám
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === NEWS SECTION === */}
      <section className={styles.newsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionBadge}>Tin tức</span>
              <h2 className={styles.sectionTitle}>Thông tin bệnh viện</h2>
            </div>
            <Link href="/news" className={styles.btnOutlineBlue}>Xem tất cả →</Link>
          </div>

          <div className={styles.newsGrid}>
            {(articles.length > 0 ? articles : MOCK_NEWS.slice(0, 3)).map((n, i) => (
              <Link key={i} href={`/news/${n.slug}`} className={styles.newsCard}>
                <div className={styles.newsImgWrap}>
                  <img src={n.coverImage || n.img} alt={n.title} className={styles.newsImg} />
                  <span className={styles.newsTag}>{n.category || n.tag}</span>
                </div>
                <div className={styles.newsBody}>
                  <span className={styles.newsDate}>{n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN') : n.date}</span>
                  <h3 className={styles.newsTitle}>{n.title}</h3>
                  <p className={styles.newsDesc}>{n.excerpt || n.desc}</p>
                  <span className={styles.newsReadMore}>Đọc thêm →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA SECTION === */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBg} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Sẵn sàng đặt lịch khám?</h2>
              <p className={styles.ctaDesc}>
                Đặt lịch ngay hôm nay — nhanh chóng, dễ dàng và không cần chờ đợi lâu.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/booking" className={styles.ctaBtnPrimary}>
                📅 Đặt lịch khám ngay
              </Link>
              <a href="tel:19001234" className={styles.ctaBtnSecondary}>
                📞 Gọi 1900 1234
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
