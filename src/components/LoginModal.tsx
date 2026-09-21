'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export default function LoginModal({ open, onClose, initialTab = 'login' }: LoginModalProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const identifierRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (open && tab === 'register') {
      setTimeout(() => identifierRef.current?.focus(), 0);
    }
  }, [open, tab]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    background: '#f8faff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(10, 22, 40, 0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '95vh',
          borderRadius: '20px',
          background: 'white',
          boxShadow: '0 40px 80px rgba(10, 22, 40, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1.5px solid #e2e8f0',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '1.1rem',
            cursor: 'pointer',
            zIndex: 10,
            lineHeight: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          aria-label="Đóng"
        >
          ×
        </button>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', padding: '2rem', flex: 1 }}>

          {/* Logo + hospital name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem', gap: '0.75rem' }}>
            <img
              src="/clinic-logo.png"
              alt="Logo Bệnh viện Hưng Lợi"
              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
            />
            <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Bệnh viện đa khoa</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0a2d6e', letterSpacing: '-0.01em' }}>HƯNG LỢI</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', marginBottom: '1.5rem' }}>
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(null); setSuccess(null); }}
                style={{
                  flex: 1,
                  padding: '0.65rem 0',
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: tab === t ? '#1a56db' : '#94a3b8',
                  borderBottom: tab === t ? '2px solid #1a56db' : '2px solid transparent',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {t === 'login' ? 'Đăng nhập' : 'Đăng ký mới'}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.9rem', fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.9rem', fontWeight: 500 }}>
              ✅ {success}
            </div>
          )}

          {/* Fields */}
          <div style={{ display: 'grid', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '0.45rem' }}>
                {tab === 'login' ? 'Email / Tên đăng nhập' : 'Số điện thoại'}
              </label>
              <input
                ref={identifierRef}
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={tab === 'login' ? 'Nhập email hoặc SĐT...' : 'Nhập số điện thoại...'}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#1a56db')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '0.45rem' }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  style={{ ...inputStyle, paddingRight: '3.5rem' }}
                  onFocus={(e) => (e.target.style.borderColor = '#1a56db')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tab === 'login') {
                      (document.getElementById('login-btn') as HTMLButtonElement)?.click();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', top: '50%', right: '0.75rem',
                    transform: 'translateY(-50%)', border: 'none',
                    background: 'transparent', color: '#64748b',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    fontFamily: 'inherit',
                  }}
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>
          </div>

          {tab === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.6rem' }}>
              <button
                type="button"
                style={{ border: 'none', background: 'transparent', color: '#1a56db', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}
                onClick={() => setError('Vui lòng liên hệ bệnh viện để đặt lại mật khẩu: 1900 1234')}
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          {/* Submit button */}
          {tab === 'login' ? (
            <button
              id="login-btn"
              type="button"
              disabled={loading}
              onClick={async () => {
                const id = identifier.trim();
                const pwd = password.trim();
                if (!id || !pwd) { setError('Vui lòng điền đầy đủ thông tin.'); return; }
                setLoading(true); setError(null);
                const result = await signIn('credentials', { redirect: false, email: id, password: pwd });
                setLoading(false);
                if (result?.error) { setError('Email hoặc mật khẩu không đúng.'); return; }
                router.push('/auth/redirect');
              }}
              style={{
                width: '100%', marginTop: '1.25rem',
                padding: '0.85rem', borderRadius: '12px', border: 'none',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1a56db 0%, #2979ff 100%)',
                color: 'white', fontSize: '1rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 6px 24px rgba(26,86,219,0.4)',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >
              {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                const phone = identifier.trim();
                const pwd = password.trim();
                if (!phone || !pwd) { setError('Vui lòng điền đầy đủ thông tin.'); return; }
                setLoading(true); setError(null); setSuccess(null);
                try {
                  const res = await fetch('/api/register', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, password: pwd }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.error || data?.message || 'Đăng ký thất bại');
                  setSuccess(data?.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
                  setTab('login'); setPassword('');
                } catch (err: any) {
                  setError(err?.message || 'Đã có lỗi xảy ra.');
                } finally {
                  setLoading(false);
                }
              }}
              style={{
                width: '100%', marginTop: '1.25rem',
                padding: '0.85rem', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #1a56db 0%, #2979ff 100%)',
                color: 'white', fontSize: '1rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 24px rgba(26,86,219,0.4)',
                fontFamily: 'inherit',
              }}
            >
              {loading ? '⏳ Đang xử lý...' : 'Đăng ký'}
            </button>
          )}

          {/* Footer note */}
          <p style={{ marginTop: '1.25rem', color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.6 }}>
            {tab === 'login'
              ? 'Chưa có tài khoản? Liên hệ quầy tiếp nhận hoặc gọi 1900 1234'
              : 'Hoàn tất đăng ký để đặt lịch và theo dõi hồ sơ sức khỏe.'}
          </p>
        </div>
      </div>
    </div>
  );
}
