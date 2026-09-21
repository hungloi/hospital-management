'use client';
import { useState } from 'react';
import LoginModal from './LoginModal';

export default function AuthCta() {
  const [isLoginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <LoginModal open={isLoginOpen} onClose={() => setLoginOpen(false)} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem 1.75rem',
            borderRadius: '14px',
            background: '#0f4fd6',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Đăng nhập
        </button>
      </div>
    </>
  );
}
