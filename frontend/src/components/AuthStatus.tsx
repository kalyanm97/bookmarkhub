'use client';
import Link from 'next/link';
import { useAuthStore } from '../stores/auth.store';
import Button from './ui/Button';

export default function AuthStatus() {
  const { user, logout } = useAuthStore();
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="link">Login</Link>
        <Link href="/register" className="link">Register</Link>
      </div>
    );
  }
  const label = user.username || user.displayName || user.email;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">Signed in as {label}</span>
      <Link href="/profile" className="link">Profile</Link>
      <Button onClick={logout} className="text-sm">Logout</Button>
    </div>
  );
}