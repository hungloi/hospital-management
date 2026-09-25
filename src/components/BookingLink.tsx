'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Props = React.PropsWithChildren<{
  href: string;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  onClick?: () => void;
}>;

export default function BookingLink({ href, children, className, style, onClick }: Props) {
  const { status } = useSession();
  const router = useRouter();

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (status === 'loading') return; // Do nothing if still loading session
    if (onClick) onClick();
    if (status === 'authenticated') {
      router.push(href);
    } else {
      // open global login modal (Navbar listens for this event)
      const ev = new CustomEvent('open-login-modal', { detail: { tab: 'login' } });
      window.dispatchEvent(ev);
    }
  };

  return (
    <button type="button" onClick={handle} className={className} style={style}>
      {children}
    </button>
  );
}
