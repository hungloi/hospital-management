import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    if (role === 'ADMIN') redirect('/admin');
    if (role === 'DOCTOR') redirect('/doctor');
  }

  const doctors = await prisma.doctor.findMany({
    take: 5,
    include: { user: true, department: true }
  });

  const departments = await prisma.department.findMany({
    take: 6,
    orderBy: { name: 'asc' }
  });

  return (
    <main style={{ fontFamily: 'var(--font-sans)', background: '#ffffff' }}>

      {/* ==================== HERO SECTION ==================== */}
      <section style={{
        position: 'relative', width: '100%', height: '680px',
        background: '#0f172a', overflow: 'hidden',
      }}>
        {/* Full-width hospital image — the visual centerpiece */}
        <img
          src="/hospital_hero.jpg"
          alt="Bệnh viện Đa khoa Hưng Lợi"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 40%', zIndex: 1,
          }}
        />
        {/* Gradient: white-opaque left → fully transparent right.
            Starts fading out at ~30%, fully gone by 68%.
            No hard edge, no visible divider. */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background:
            'linear-gradient(to right, rgba(248,250,252,0.97) 0%, rgba(248,250,252,0.94) 22%, rgba(248,250,252,0.75) 36%, rgba(248,250,252,0.25) 52%, transparent 68%)',
        }} />
        <div className="container" style={{
          position: 'relative', zIndex: 3, height: '100%',
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{ maxWidth: '500px' }}>
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: '#fee2e2', color: '#dc2626',
              fontSize: '0.75rem', fontWeight: 600,
              padding: '0.3rem 0.9rem', borderRadius: '999px', marginBottom: '1.4rem',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#dc2626"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Vì một cộng đồng khỏe mạnh hơn
            </div>
            {/* Main heading */}
            <h1 style={{
              margin: '0 0 0.1rem 0', lineHeight: 1.1,
              fontSize: '3.1rem', fontWeight: 800,
              color: '#0f172a', letterSpacing: '-0.02em',
            }}>Bệnh viện Đa khoa</h1>
            <h1 style={{
              margin: '0 0 1.1rem 0', lineHeight: 1,
              fontSize: '4.2rem', fontWeight: 900,
              color: '#1d4ed8', letterSpacing: '-0.03em',
            }}>Hưng Lợi</h1>
            {/* Tagline */}
            <p style={{
              margin: '0 0 0.6rem 0', fontSize: '1.05rem', fontWeight: 700,
              color: '#1e293b',
            }}>Chất lượng – Tận tâm – Vì người bệnh</p>
            {/* Body text */}
            <p style={{
              margin: '0 0 2rem 0', fontSize: '0.95rem', lineHeight: 1.7,
              color: '#475569', maxWidth: '420px',
            }}>
              Với đội ngũ y bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại cùng dịch vụ chăm sóc tận tâm, chúng tôi luôn đồng hành cùng bạn trên hành trình chăm sóc sức khỏe.
            </p>
            {/* CTAs */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Link href="/booking" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: '#1d4ed8', color: '#fff',
                padding: '0.8rem 1.7rem', borderRadius: '10px',
                fontWeight: 700, fontSize: '0.93rem', textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(29,78,216,0.35)',
              }}>
                <CalendarIcon /> Đặt lịch khám ngay
              </Link>
              <Link href="/about" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.9)', color: '#334155',
                padding: '0.8rem 1.7rem', borderRadius: '10px',
                fontWeight: 600, fontSize: '0.93rem', textDecoration: 'none',
                border: '1.5px solid #cbd5e1',
              }}>
                <SearchIcon /> Tìm hiểu về bệnh viện
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DỊCH VỤ NHANH ==================== */}
      <section className="container" style={{ marginTop: '-24px', marginBottom: '3.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: 'white', borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9',
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          overflow: 'hidden',
        }}>
          {([
            { icon: <CalendarIcon />, label: 'Dặt lịch khám', sub: 'Nhanh chóng, tiện lợi', href: '/booking' },
            { icon: <DocumentIcon />, label: 'Tra cứu kết quả', sub: 'Xét nghiệm, chẩn đoán', href: '#' },
            { icon: <CardIcon />, label: 'Thanh toán online', sub: 'An toàn, bảo mật', href: '#' },
            { icon: <FlaskIcon />, label: 'Hồ sơ sức khỏe', sub: 'Lưu trữ thông tin', href: '#' },
            { icon: <HeadphoneIcon />, label: 'Hỗ trợ trực tuyến', sub: 'Hỗ trợ 24/7', href: '#' },
          ] as const).map((item, i) => (
            <Link key={i} href={item.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '1.4rem 1rem', gap: '0.55rem', textDecoration: 'none',
              borderRight: i < 4 ? '1px solid #f1f5f9' : 'none',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: '#eff6ff', color: '#1d4ed8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{item.icon}</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{item.label}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '2px' }}>{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== CHUYÊN KHOA ==================== */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <Header badge="CHUYÊN KHOA" title="Các chuyên khoa nổi bật" desc="Đội ngũ bác sĩ chuyên môn cao, trang thiết bị hiện đại, đáp ứng đa dạng nhu cầu khám chữa bệnh." link="/departments" linkLabel="Xem tất cả chuyên khoa →" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1.25rem' }}>
          <DeptCard img="/dept_general.jpg" title="Nội khoa" desc="Khám và điều trị nội khoa tổng quát" />
          <DeptCard img="/dept_general.jpg" title="Ngoại khoa" desc="Phẫu thuật, điều trị các bệnh lý ngoại khoa" />
          <DeptCard img="/dept_pediatrics.jpg" title="Sản phụ khoa" desc="Chăm sóc sức khỏe mẹ và bé" />
          <DeptCard img="/dept_pediatrics.jpg" title="Nhi khoa" desc="Khám và điều trị trẻ em" />
          <DeptCard img="/dept_general.jpg" title="Tim mạch" desc="Chẩn đoán và điều trị bệnh lý tim mạch" />
          <DeptCard img="/dept_general.jpg" title="Xét nghiệm" desc="Chẩn đoán chính xác, hiệu quả điều trị cao" />
        </div>
      </section>

      {/* ==================== BÁC SĨ ==================== */}
      <section className="container" style={{ marginBottom: '4.5rem' }}>
        <Header badge="ĐỘI NGŨ BÁC SĨ TIÊU BIỂU" title="Bác sĩ giỏi - Tận tâm - Chuyên môn cao" desc="Đội ngũ bác sĩ tại Bệnh viện Đa khoa Hưng Lợi đều là những chuyên gia đầu ngành, được đào tạo bài bản trong và ngoài nước." link="/doctors" linkLabel="Xem tất cả bác sĩ →" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem' }}>
          {doctors.map((d: any, i) => (
            <DocCard
              key={d.id}
              img={i % 2 === 0 ? "/doctor_male.jpg" : "/doctor_female.jpg"}
              name={`BS. ${d.user.name}`}
              dept={`Chuyên khoa ${d.department?.name || d.specialty}`}
              exp={`${10 + i}+ năm kinh nghiệm`}
            />
          ))}
        </div>
      </section>

      {/* ==================== TIN TỨC & CẨM NANG ==================== */}
      <section className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '4.5rem' }}>
        {/* Tin tức */}
        <div>
          <Header badge="TIN TỨC" title="Tin tức & Sự kiện" desc="Cập nhật những thông tin mới nhất về sức khỏe, hoạt động bệnh viện và các chương trình cộng đồng." link="/news" linkLabel="Xem tất cả tin tức →" small />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            <NewsItem img="/hospital_hero.jpg" date="26/04/2026" title="Khai trương khoa Tim mạch với trang thiết bị hiện đại" />
            <NewsItem img="/dept_pediatrics.jpg" date="15/04/2026" title="Tăng cường tiêm chủng cho trẻ vào mùa hè" />
            <NewsItem img="/dept_general.jpg" date="10/04/2026" title="Bệnh viện triển khai khám bệnh qua ứng dụng di động" />
          </div>
        </div>

        {/* Cẩm nang */}
        <div>
          <Header badge="CẨM NANG SỨC KHỎE" title="Kiến thức y tế hữu ích" desc="Những bài viết được biên soạn bởi đội ngũ chuyên gia của bệnh viện." link="/news/health" linkLabel="Xem tất cả →" small />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <GuideRow img="/dept_general.jpg" title="Chế độ dinh dưỡng cho người tiểu đường" />
            <GuideRow img="/dept_pediatrics.jpg" title="3 thói quen giúp tăng cường sức đề kháng" />
            <GuideRow img="/dept_pediatrics.jpg" title="Phòng ngừa bệnh cảm mùa ở trẻ em" />
          </div>
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section style={{ background: '#f4f9ff', padding: '1.5rem 0', borderTop: '1px solid #e2e8f0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#1d4ed8', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>Vì sức khỏe của bạn và gia đình</h3>
              <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Đặt lịch khám ngay để được đội ngũ chuyên gia của chúng tôi chăm sóc tận tình.</p>
            </div>
          </div>
          <Link href="/booking" style={{ background: '#1d4ed8', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
            Đặt lịch khám ngay →
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ===== COMPONENTS ===== */

function SvcLink({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Link href="#" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
      <div style={{ background: '#eff6ff', color: '#1d4ed8', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>{label}</div>
    </Link>
  );
}

function Header({ badge, title, desc, link, linkLabel, small }: { badge: string; title: string; desc: string; link: string; linkLabel: string; small?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: small ? 'center' : 'flex-end', marginBottom: '1.5rem' }}>
      <div>
        <span style={{ color: '#1d4ed8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{badge}</span>
        <h2 style={{ color: '#0f172a', fontSize: small ? '1.25rem' : '1.5rem', fontWeight: 700, margin: '0.5rem 0 0 0' }}>{title}</h2>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.85rem', maxWidth: '600px' }}>{desc}</p>
      </div>
      <Link href={link} style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'none', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{linkLabel}</Link>
    </div>
  );
}

function DeptCard({ img, title, desc }: { img: string; title: string; desc: string }) {
  return (
    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s' }}>
      <div style={{ width: '100%', height: '120px' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1 }}>
        <div style={{ background: '#eff6ff', color: '#1d4ed8', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.85rem', fontWeight: 700 }}>{title}</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.7rem', lineHeight: 1.4 }}>{desc}</p>
        </div>
        <div style={{ color: '#cbd5e1', fontSize: '1rem' }}>→</div>
      </div>
    </div>
  );
}

function DocCard({ img, name, title, exp }: { img: string; name: string; title: string; exp: string }) {
  return (
    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem', flex: 1 }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
          <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3 }}>{name}</h4>
          <div style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '0.2rem', lineHeight: 1.3 }}>{title}</div>
          <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{exp}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ color: '#eab308', fontSize: '0.75rem', fontWeight: 600 }}>⭐ 4.9</div>
        <Link href="/booking" style={{ background: '#1d4ed8', color: 'white', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none' }}>
          Đặt lịch khám
        </Link>
      </div>
    </div>
  );
}

function NewsItem({ img, date, title }: { img: string; date: string; title: string }) {
  return (
    <Link href="#" style={{ textDecoration: 'none', display: 'block', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '120px' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '1rem' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.4rem' }}>{date}</div>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4 }}>{title}</h4>
        <div style={{ color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 600 }}>Xem chi tiết →</div>
      </div>
    </Link>
  );
}

function GuideRow({ img, title }: { img: string; title: string }) {
  return (
    <Link href="#" style={{ display: 'flex', gap: '1rem', textDecoration: 'none', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
      <div style={{ width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3 }}>{title}</h4>
        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Đọc thêm →</span>
      </div>
    </Link>
  );
}

/* SVGs */
const CalendarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const DocumentIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const CardIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const HeadphoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const FlaskIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><line x1="5.52" y1="16" x2="18.48" y2="16"></line></svg>;
const LocationIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
