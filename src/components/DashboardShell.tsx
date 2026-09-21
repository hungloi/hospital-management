'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { normalizeUserDisplayName, formatPatientCode } from '@/lib/userUtils';

type NavItem = { href: string; icon: string; label: string };

type Props = {
  title: string;
  subtitle: string;
  items: NavItem[];
  theme: {
    bg: string;
    sidebar: string;
    border: string;
    activeText: string;
    activeBg: string;
    textMuted: string;
    text: string;
    accentColor?: string;
  };
  footer?: React.ReactNode;
};

export default function DashboardShell({ title, subtitle, items, theme, footer, children }: Props & { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userName, setUserName] = useState(title);
  const [userRole, setUserRole] = useState(subtitle);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || title);
      setUserRole(((session.user as any).role) || subtitle);
      setUserPhone(((session.user as any).phone) || null);
    }

    const onProfileUpdated = (e: any) => {
      const d = e?.detail || {};
      if (d.name) setUserName(d.name);
      if (d.phone) setUserPhone(d.phone);
      if (d.role) setUserRole(d.role);
    };
    window.addEventListener('profile-updated', onProfileUpdated as EventListener);

    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.name) setUserName(u.name);
        if (u?.phone) setUserPhone(u.phone);
        if (u?.role) setUserRole(u.role);
      }
    } catch (e) {}

    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/patient/profile');
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          const u = json.user || {};
          if (u.name) setUserName(u.name);
          if (u.phone) setUserPhone(u.phone);
          if (u.role) setUserRole(u.role);
        }
      } catch (e) {}
    })();

    return () => {
      window.removeEventListener('profile-updated', onProfileUpdated as EventListener);
      mounted = false;
    };
  }, [session, title, subtitle]);

  const displayName = normalizeUserDisplayName(userName);
  const initials = (displayName || '').split(' ').slice(-2).map(n => n[0]).join('').toUpperCase() || 'U';
  const patientCode = formatPatientCode(userPhone, (session?.user as any)?.id || null);

  const ROLE_LABELS: Record<string, string> = {
    PATIENT: 'Bệnh nhân',
    ADMIN: 'Quản trị viên',
    DOCTOR: 'Bác sĩ',
    NURSE: 'Điều dưỡng',
    STAFF: 'Nhân sự',
    RECEPTIONIST: 'Tiếp tân',
    PHARMACIST: 'Dược sĩ',
    ACCOUNTANT: 'Kế toán',
    LAB_TECH: 'Kỹ thuật viên XN',
    DIRECTOR: 'Giám đốc',
    HEAD_DOCTOR: 'Trưởng khoa'
  };

  const ROLE_ICONS: Record<string, string> = {
    PATIENT: '🧑',
    ADMIN: '⚙️',
    DOCTOR: '🩺',
    NURSE: '💉',
    STAFF: '🗂️',
    RECEPTIONIST: '🖥️',
    PHARMACIST: '💊',
    ACCOUNTANT: '📊',
    LAB_TECH: '🔬',
    DIRECTOR: '🏛️',
    HEAD_DOCTOR: '👨‍⚕️'
  };

  const displayRole = ROLE_LABELS[userRole] || userRole || subtitle;
  const roleIcon = ROLE_ICONS[userRole] || '👤';
  const accent = theme.accentColor || '#1a56db';

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex' }}>
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '248px', flexShrink: 0,
        background: '#0a1628', // Always Deep Navy
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
        height: '100vh', overflow: 'hidden',
      }}>
        {/* ── Hospital Brand ── */}
        <div style={{
          padding: '1.25rem 1rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '10px',
              padding: '4px',
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <img src="/clinic-logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Bệnh viện đa khoa</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1 }}>Hưng Lợi</div>
            </div>
          </div>
        </div>

        {/* ── User Profile Card ── */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {session?.user?.image ? (
              <img src={(session.user as any).image} alt="avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                background: `linear-gradient(135deg, ${accent} 0%, ${accent}99 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.9rem', color: 'white'
              }}>
                {initials || 'U'}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName || userName}
              </div>
              {patientCode && userRole === 'PATIENT' && (
                <div style={{ fontSize: '0.72rem', color: accent, fontWeight: 600, marginTop: '1px' }}>{patientCode}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ fontSize: '0.7rem' }}>{roleIcon}</span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{displayRole}</span>
              </div>
            </div>
          </div>
          <Link href="/patient/profile" style={{
            display: 'block', marginTop: '0.65rem',
            padding: '0.35rem 0.75rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.75rem', fontWeight: 600,
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            Cập nhật hồ sơ
          </Link>
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
          {items.map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'));
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.55rem 0.875rem',
                margin: '0.05rem 0',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.845rem',
                fontWeight: active ? 700 : 400,
                background: active
                  ? `linear-gradient(135deg, ${accent}22 0%, ${accent}11 100%)`
                  : 'transparent',
                color: active ? accent : 'rgba(255,255,255,0.55)',
                borderLeft: active ? `3px solid ${accent}` : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}>
                <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Footer / Sign out ── */}
        <div style={{ padding: '0.75rem 0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {footer}
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.55rem 0.875rem',
            borderRadius: '10px',
            fontSize: '0.84rem', fontWeight: 600,
            background: 'rgba(239, 68, 68, 0.08)',
            color: 'rgba(239,68,68,0.85)',
            width: '100%', border: '1px solid rgba(239,68,68,0.15)',
            cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.2s'
          }}>
            <span>⏻</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, marginLeft: '248px', minHeight: '100vh', background: theme.bg, color: theme.text }}>
        {children}
      </main>

      <style>{`
        /* Sidebar scrollbar */
        aside nav::-webkit-scrollbar { width: 4px; }
        aside nav::-webkit-scrollbar-track { background: transparent; }
        aside nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        /* Nav hover */
        aside nav a:hover {
          background: rgba(255,255,255,0.06) !important;
          color: rgba(255,255,255,0.9) !important;
        }

        /* Sign out hover */
        aside footer button:hover, aside > div:last-child button:hover {
          background: rgba(239, 68, 68, 0.15) !important;
          color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
}
