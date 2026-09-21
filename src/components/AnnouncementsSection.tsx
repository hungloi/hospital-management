'use client';
import styles from '@/app/page.module.css';

const announcements = [
  {
    title: 'Lịch khám miễn phí cho người cao tuổi',
    date: '18/08/2026',
    summary: 'Khám chuyên khoa miễn phí cho người cao tuổi tại Khoa Nội tổng hợp. Đăng ký trước để giữ chỗ.',
  },
  {
    title: 'Cập nhật giờ làm việc phòng xét nghiệm',
    date: '16/08/2026',
    summary: 'Phòng xét nghiệm mở cửa từ 07:00 đến 19:00 tất cả các ngày trong tuần để phục vụ lấy mẫu và trả kết quả nhanh.',
  },
  {
    title: 'Hội thảo sức khỏe cộng đồng',
    date: '20/08/2026',
    summary: 'Tham gia buổi hội thảo trực tuyến về dinh dưỡng và phòng ngừa bệnh mạn tính do đội ngũ bác sĩ bệnh viện tổ chức.',
  },
];

export default function AnnouncementsSection() {
  return (
    <section className={styles.announcementsSection}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionLabel}>Thông báo</p>
            <h2 className={styles.sectionTitle}>Thông tin nổi bật từ bệnh viện</h2>
          </div>
          <p className={styles.sectionDescription}>
            Cập nhật nhanh những thông báo quan trọng, lịch làm việc và chương trình chăm sóc sức khỏe dành cho cộng đồng.
          </p>
        </div>

        <div className={styles.announcementGrid}>
          {announcements.map((announcement, index) => (
            <article key={index} className={styles.announcementCard}>
              <div className={styles.announcementMeta}>
                <span className={styles.announcementDate}>{announcement.date}</span>
                <span className={styles.announcementBadge}>Mới</span>
              </div>
              <h3>{announcement.title}</h3>
              <p>{announcement.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
