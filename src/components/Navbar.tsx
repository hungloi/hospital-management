'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginModal from './LoginModal';
import { normalizeUserDisplayName } from '@/lib/userUtils';

const DASHBOARD_PATHS = ['/admin', '/doctor', '/patient', '/nurse', '/reception', '/pharmacy', '/accountant', '/director', '/staff', '/clinic', '/lab', '/inventory'];

const NAV_LINKS = [
  { href: '/services', label: 'Dịch vụ' },
  { href: '/doctors', label: 'Bác sĩ' },
  { href: '/booking', label: 'Đặt lịch' },
  { href: '/news', label: 'Tin tức' },
  { href: '/about', label: 'Về chúng tôi' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState<string | null>(
    normalizeUserDisplayName(session?.user?.name || null) || null
  );
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setDisplayName(normalizeUserDisplayName(session?.user?.name || null) || null);
  }, [session]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onProfileUpdated = (e: any) => {
      const d = e?.detail || {};
      if (d.name) setDisplayName(d.name);
    };
    window.addEventListener('profile-updated', onProfileUpdated as EventListener);
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.name) setDisplayName(normalizeUserDisplayName(u.name));
      }
    } catch (e) {}
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/patient/profile');
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          if (json?.user?.name) setDisplayName(normalizeUserDisplayName(json.user.name));
        }
      } catch (e) {}
    })();
    return () => {
      window.removeEventListener('profile-updated', onProfileUpdated as EventListener);
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onOpen = (e: any) => {
      const tab = e?.detail?.tab || 'login';
      setInitialTab(tab);
      setLoginOpen(true);
    };
    window.addEventListener('open-login-modal', onOpen);
    return () => window.removeEventListener('open-login-modal', onOpen);
  }, []);

  const isDashboard = DASHBOARD_PATHS.some(p => pathname === p || pathname?.startsWith(`${p}/`));
  if (isDashboard) return null;

  return (
    <>
      <LoginModal open={isLoginOpen} initialTab={initialTab} onClose={() => setLoginOpen(false)} />

      {/* Top bar */}
      <div style={{
        background: 'linear-gradient(90deg, #061a45 0%, #0a2d6e 100%)',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '0.8rem',
        padding: '0.5rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span>📞 Hotline: <strong style={{ color: '#00c6a2' }}>1900 1234</strong></span>
            <span>⏰ T2-T6: 6:00 - 16:00</span>
            <span>📍 123 Đường Y Tế, Q.1, TP.HCM</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ opacity: 0.7 }}>Bảo hiểm Y tế (BHYT)</span>
            <span>|</span>
            <span style={{ opacity: 0.7 }}>Cấp cứu 24/7</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#ffffff',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(10,29,100,0.12)' : '0 1px 0 rgba(10,29,100,0.08)',
        transition: 'all 0.3s ease',
      }}>
        <div className="container" style={{ padding: '0.85rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 }}>
            <img
              src="/clinic-logo.png"
              alt="Logo Bệnh viện Hưng Lợi"
              style={{ width: '64px', height: '64px', objectFit: 'contain', display: 'block' }}
            />
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Bệnh viện đa khoa</div>
              <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0a2d6e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>HƯNG LỢI</div>
            </div>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', gap: '0.25rem', flex: 1, justifyContent: 'center' }}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname?.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: active ? '#1a56db' : '#374151',
                    background: active ? 'rgba(26,86,219,0.08)' : 'transparent',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(26,86,219,0.06)';
                      (e.currentTarget as HTMLElement).style.color = '#1a56db';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = '#374151';
                    }
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Auth area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {status === 'authenticated' && session?.user ? (
              <>
                <Link href="/patient" style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem', borderRadius: '10px',
                  background: 'rgba(26,86,219,0.08)', color: '#1a56db',
                  fontWeight: 600, fontSize: '0.9rem',
                }}>
                  <span>👤</span>
                  <span>{displayName || session.user.name || 'Tài khoản'}</span>
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setInitialTab('login'); setLoginOpen(true); }}
                  style={{
                    padding: '0.55rem 1.1rem', borderRadius: '10px',
                    border: '1.5px solid rgba(26,86,219,0.25)',
                    background: 'transparent', color: '#1a56db',
                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(26,86,219,0.06)';
                    (e.currentTarget as HTMLElement).style.borderColor = '#1a56db';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,86,219,0.25)';
                  }}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => { setInitialTab('register'); setLoginOpen(true); }}
                  style={{
                    padding: '0.55rem 1.25rem', borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #1a56db 0%, #2979ff 100%)',
                    color: 'white',
                    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(26,86,219,0.35)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(26,86,219,0.45)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(26,86,219,0.35)';
                  }}
                >
                  Đặt lịch ngay
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
