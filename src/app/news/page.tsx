import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;

  const where = category ? { category } : {};

  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });

  const categories = [
    { id: '', label: 'Tất cả' },
    { id: 'NEWS', label: 'Tin tức bệnh viện' },
    { id: 'MEDICAL', label: 'Kiến thức y khoa' },
    { id: 'ANNOUNCEMENT', label: 'Thông báo' },
  ];

  return (
    <div className="container" style={{ padding: '4rem 0', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
          Tin tức & Sự kiện
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Cập nhật những thông tin y tế, kiến thức chăm sóc sức khỏe và thông báo mới nhất từ Bệnh viện Đa khoa Medicare.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
        {categories.map(c => {
          const isActive = category === c.id || (!category && !c.id);
          return (
            <Link key={c.id} href={`/news${c.id ? `?category=${c.id}` : ''}`} style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '30px',
              fontWeight: 600,
              textDecoration: 'none',
              backgroundColor: isActive ? 'var(--primary-color)' : 'white',
              color: isActive ? 'white' : 'var(--text-main)',
              border: `1px solid ${isActive ? 'var(--primary-color)' : 'var(--border-color)'}`,
              transition: 'all 0.2s'
            }}>
              {c.label}
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {articles.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Chưa có bài viết nào trong chuyên mục này.
          </div>
        ) : (
          articles.map(article => (
            <Link key={article.id} href={`/news/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass hover-lift" style={{ borderRadius: '16px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)' }}>
                <div style={{ height: '200px', backgroundColor: '#e2e8f0', backgroundImage: article.coverImage ? `url(${article.coverImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                      {categories.find(c => c.id === article.category)?.label || article.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Intl.DateTimeFormat('vi-VN').format(new Date(article.createdAt))}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    {article.title}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.excerpt}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Bởi {article.author.name}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>Đọc tiếp →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
