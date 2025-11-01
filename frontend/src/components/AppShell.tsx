'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import AuthMenu from './AuthMenu';
import CreateBookmark from './CreateBookmark';
import { useAuthStore } from '../stores/auth.store';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const refreshMe = useAuthStore((s) => s.refreshMe);

  useEffect(() => {
    refreshMe().catch(() => void 0);
  }, [refreshMe]);

  return (
    <div className="container">
      <header className="topbar" role="navigation" aria-label="Main">
        <div className="brand">
          <Link href="/" aria-label="BookmarkHub Home">
            <span className="mr-2">📌</span> BookmarkHub
          </Link>
        </div>
        <div className="spacer" />
        <CreateBookmark />
        <AuthMenu />
      </header>
      <main>{children}</main>
    
    </div>
  );
}