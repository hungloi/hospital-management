'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import { createArticle } from '@/app/actions/articleActions';
import Link from 'next/link';



export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-'));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createArticle(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin/articles');
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' };

  return (
    <DashboardShell title="Admin" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME} >
      <div style={{ padding: '2rem', color: '#0f172a', maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin/articles" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>← Quay lại danh sách</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>Đăng bài viết mới</h1>
        </div>

        {error && <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Tiêu đề bài viết *</label>
            <input name="title" value={title} onChange={handleTitleChange} required style={inputStyle} placeholder="Nhập tiêu đề..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Đường dẫn (Slug) *</label>
              <input name="slug" value={slug} onChange={e => setSlug(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Chuyên mục</label>
              <select name="category" style={inputStyle}>
                <option value="NEWS">Tin tức bệnh viện</option>
                <option value="MEDICAL">Kiến thức y khoa</option>
                <option value="ANNOUNCEMENT">Thông báo</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>URL Ảnh bìa (Cover Image)</label>
            <input name="coverImage" style={inputStyle} placeholder="https://example.com/image.jpg" />
          </div>

          <div>
            <label style={labelStyle}>Tóm tắt (Excerpt)</label>
            <textarea name="excerpt" rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Đoạn tóm tắt ngắn gọn..." />
          </div>

          <div>
            <label style={labelStyle}>Nội dung bài viết * (Hỗ trợ định dạng HTML/Markdown cơ bản)</label>
            <textarea name="content" required rows={15} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace' }} placeholder="Viết nội dung tại đây..." />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '1rem', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}>
            {loading ? 'Đang lưu...' : 'Đăng bài viết'}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}



