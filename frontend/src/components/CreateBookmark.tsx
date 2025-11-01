'use client';

import Link from 'next/link';
import { useAuthStore } from '../stores/auth.store';

export default function CreateBookmark() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return <Link href="/bookmarks/new" className="link">+ New Bookmark</Link>;
}