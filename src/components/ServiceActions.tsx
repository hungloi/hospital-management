'use client';
import { useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';

export default function ServiceActions() {
  const router = useRouter();
  const actions = [
    { icon: '🩺', title: 'Đăng ký khám', desc: 'Chọn lịch khám và đặt hẹn nhanh chóng.', href: '/booking' },
    { icon: '📄', title: 'Tra cứu kết quả', desc: 'Xem xét nghiệm và hồ sơ điều trị trực tuyến.', href: '/login' },
    { icon: '💬', title: 'Hỗ trợ 24/7', desc: 'Nhận hỗ trợ từ đội ngũ bệnh viện mọi lúc.', href: '/faq' },
    { icon: '🏥', title: 'Thông tin dịch vụ', desc: 'Tìm hiểu chuyên khoa, thời gian và quy trình khám.', href: '/services' },
  ];

  return (
    <section className={styles.servicesSection}>
        <div className="container">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionLabel}>Dịch vụ nổi bật</p>
              <h2 className={styles.sectionTitle}>Các tiện ích chính</h2>
            </div>
            <p className={styles.sectionDescription}>
              Nhanh chóng truy cập đặt lịch, tìm bác sĩ, tra cứu kết quả xét nghiệm và quản lý hồ sơ bệnh án.
            </p>
          </div>

          <div className={styles.quickActions}>
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                className={styles.actionCard}
                onClick={() => router.push(action.href)}
              >
                <div className={styles.actionIcon}>{action.icon}</div>
                <div>
                  <h3>{action.title}</h3>
                  <p>{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
  );
}
