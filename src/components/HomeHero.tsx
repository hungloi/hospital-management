'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BookingLink from '@/components/BookingLink';
import styles from '@/app/page.module.css';

const STATS = [
  { value: '50,000+', label: 'Bệnh nhân', icon: '🏥' },
  { value: '120+', label: 'Chuyên gia', icon: '👨‍⚕️' },
  { value: '25', label: 'Năm kinh nghiệm', icon: '⭐' },
  { value: '30+', label: 'Chuyên khoa', icon: '🔬' },
];

const FEATURES = [
  { icon: '📅', text: 'Đặt lịch online nhanh chóng, không cần chờ đợi' },
  { icon: '🔬', text: 'Tra cứu kết quả xét nghiệm ngay tức thì' },
  { icon: '💬', text: 'Tư vấn sức khỏe 24/7 từ đội ngũ chuyên gia' },
];

export default function HomeHero() {
  const router = useRouter();

  return (
    <section className={styles.heroSection}>
      {/* Animated background blobs */}
      <div className={styles.heroBlob1} />
      <div className={styles.heroBlob2} />
      <div className={styles.heroBlob3} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className={styles.heroRow}>

          {/* LEFT: Text */}
          <div className={styles.heroText}>
            {/* Badge */}
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              <span>Bệnh viện đạt chuẩn Bộ Y tế</span>
            </div>

            <h1 className={styles.heroTitle}>
              Chăm sóc sức khỏe{' '}
              <span className={styles.heroTitleGradient}>toàn diện</span>
              {' '}& chuyên nghiệp
            </h1>

            <p className={styles.heroSubtitle}>
              Đặt lịch khám trực tuyến, tra cứu kết quả xét nghiệm và quản lý hồ sơ sức khỏe — tất cả trong một nền tảng duy nhất.
            </p>

            {/* CTA buttons */}
            <div className={styles.heroCtas}>
              <BookingLink href="/booking" className={styles.btnPrimary}>
                <span>📅</span> Đặt lịch khám ngay
              </BookingLink>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className={styles.btnOutline}
              >
                <span>🔍</span> Tra cứu kết quả
              </button>
            </div>

            {/* Features */}
            <div className={styles.heroFeatures}>
              {FEATURES.map((f, i) => (
                <div key={i} className={styles.heroFeatureItem}>
                  <span className={styles.heroFeatureIcon}>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Card + Image */}
          <div className={styles.heroAside}>
            {/* Floating image card */}
            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=800&q=80"
                alt="Bác sĩ khám bệnh"
                className={styles.heroImage}
              />
              {/* Floating badge */}
              <div className={styles.heroImageBadge}>
                <div className={styles.heroImageBadgeIcon}>✅</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0a2d6e' }}>ISO 9001:2015</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>Chứng nhận chất lượng</div>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className={styles.heroStatsGrid}>
              {STATS.map((s, i) => (
                <div key={i} className={styles.heroStatCard}>
                  <span className={styles.heroStatIcon}>{s.icon}</span>
                  <strong className={styles.heroStatValue}>{s.value}</strong>
                  <span className={styles.heroStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
