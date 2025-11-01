'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import Button from './ui/Button';

export default function AuthMenu() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (e.target instanceof Node) {
        const insideButton = btnRef.current && btnRef.current.contains(e.target);
        const insideMenu = menuRef.current && menuRef.current.contains(e.target);
        if (!insideButton && !insideMenu) setOpen(false);
      }
    }
  document.addEventListener('click', onDoc);
  return () => document.removeEventListener('click', onDoc);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login" className="link">Login</Link>
        <Link href="/register" className="link">Register</Link>
      </div>
    );
  }

  const name = user.displayName ?? user.username ?? user.email;

  return (
  <div className="relative">
      <button
        ref={btnRef}
        onClick={() => {
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        title="Menu"
        className="p-2 rounded-md bg-transparent text-inherit hover:bg-zinc-800"
      >
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect y="1" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="6" width="20" height="2" rx="1" fill="currentColor" />
          <rect y="11" width="20" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 rounded-md bg-[#0f1720] border border-[#111318] shadow-lg z-[1200] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#111318]">
            <div className="text-sm font-semibold text-blue-300">{name}</div>
            <div className="text-xs text-zinc-400 mt-1">{user.email}</div>
          </div>
          <Link href="/profile" className="block px-4 py-2 text-sm text-inherit" onClick={() => setOpen(false)}>Profile</Link>
          <Button
            onClick={async () => {
              setOpen(false);
              try {
                await logout();
              } finally {
                router.push('/');
              }
            }}
            className="w-full text-left px-4 py-2"
          >
            Logout
          </Button>
        </div>
  )}
    </div>
  );
}