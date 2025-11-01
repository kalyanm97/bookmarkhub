"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeedStore } from '../stores/bookmarks.store';
import { useAuthStore } from '../stores/auth.store';
import Button from './ui/Button';
import Input from './ui/Input';
import ErrorCard from './ErrorCard';
import { useToast } from './ui/Toast';

export default function CreateBookmarkForm({ onDone }: { onDone?: () => void }) {
  const { create } = useFeedStore();
  const user = useAuthStore((s) => s.user);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = (() => {
    try {
      return useToast();
    } catch (e) {
  return { push: (..._args: unknown[]) => { void _args; } } as const;
    }
  })();

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setErr(null);
    if (!title.trim()) return setErr('Title is required');
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`;
    if (!/^https?:\/\//i.test(cleanUrl)) return setErr('URL must start with http:// or https://');

    try {
      setBusy(true);
      if (!user) {
        try {
          await refreshMe();
        } catch (e) { void e; }
      }
      const u = useAuthStore.getState().user;
  if (!u) return setErr('You must be logged in to create a bookmark');
  await create(title.trim(), cleanUrl);
  setTitle('');
  setUrl('');
  if (onDone) onDone();
  router.push('/');
  try { toast.push({ type: 'success', message: 'Bookmark created' }); } catch (e) { void e; }
  } catch (e: unknown) {
      const msg = (e && typeof e === 'object' && 'message' in e) ? String((e as unknown as { message?: unknown }).message ?? 'Failed to create bookmark') : String(e ?? 'Failed to create bookmark');
      if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('missing token')) {
        setErr('You must be logged in to create a bookmark');
      } else setErr(msg);
  try { toast.push({ type: 'error', message: msg }); } catch (e) { void e; }
    } finally {
      setBusy(false);
    }
  }

  return (
  <form onSubmit={handleSubmit} className="card mx-auto max-w-[720px]">
      <h3>Create Bookmark</h3>
      <div className="grid gap-2">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
  {err && <ErrorCard title="Create failed" message={err} onRetry={handleSubmit} />}
        <div className="flex justify-end gap-2">
          <Button type="submit" className="primary" loading={busy}>{busy ? 'Creating…' : 'Create'}</Button>
        </div>
      </div>
    </form>
  );
}
