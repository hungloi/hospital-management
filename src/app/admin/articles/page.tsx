import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';



export default async function AdminArticlesPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/login');

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });

  return (
    <DashboardShell title={session.user.name!} subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME} >
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>📰 Quản lý Tin tức / Bài viết</h1>
            <p style={{ color: '#475569', marginTop: '4px' }}>Tổng số {articles.length} bài viết</p>
          </div>
          <Link href="/admin/articles/new" style={{ padding: '0.75rem 1.5rem', background: '#38bdf8', color: '#0f172a', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
            + Đăng bài mới
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {articles.length === 0 ? (
            <p style={{ color: '#475569', padding: '1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>Chưa có bài viết nào.</p>
          ) : (
            articles.map(article => (
              <div key={article.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
                <div style={{ height: '160px', backgroundColor: '#e2e8f0', backgroundImage: article.coverImage ? `url(${article.coverImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb' }}>{article.category}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>👁️ {article.viewCount}</span>
                  </div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.title}
                  </h2>
                  <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.excerpt}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Bởi <strong style={{ color: '#0f172a' }}>{article.author.name}</strong> • {new Intl.DateTimeFormat('vi-VN').format(new Date(article.createdAt))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}



