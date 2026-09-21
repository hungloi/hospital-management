import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: true }
  });

  if (!article) notFound();

  // Tăng view count (ở chế độ server component thì việc update có thể hơi chậm nếu làm đồng bộ, 
  // nhưng tạm thời ta có thể làm đơn giản thế này)
  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } }
  });

  const categories: Record<string, string> = { NEWS: 'Tin tức bệnh viện', MEDICAL: 'Kiến thức y khoa', ANNOUNCEMENT: 'Thông báo' };

  return (
    <div style={{ backgroundColor: '#f8faff', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <Link href="/news" style={{ display: 'inline-block', marginBottom: '2rem', color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
          ← Quay lại Tin tức
        </Link>

        <article className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {article.coverImage && (
            <div style={{ width: '100%', height: '350px', backgroundImage: `url(${article.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          )}
          
          <div style={{ padding: '3rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '6px 14px', borderRadius: '20px', background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                {categories[article.category] || article.category}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(new Date(article.createdAt))}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: 'auto' }}>
                👁️ {article.viewCount + 1} lượt xem
              </span>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1.5rem', lineHeight: '1.3' }}>
              {article.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {article.author.name.charAt(0)}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)', fontSize: '1.1rem' }}>{article.author.name}</p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{article.author.role === 'ADMIN' ? 'Quản trị viên' : 'Bác sĩ chuyên khoa'}</p>
              </div>
            </div>

            <div 
              style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-main)' }}
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>

      </div>
      <style>{`
        .article-content h1, .article-content h2, .article-content h3 {
          color: var(--primary-dark);
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .article-content ul, .article-content ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }
        .article-content li {
          margin-bottom: 0.5rem;
        }
        .article-content p {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}
