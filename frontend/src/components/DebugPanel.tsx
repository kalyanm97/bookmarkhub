"use client";
import { useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useFeedStore } from '../stores/bookmarks.store';

export default function DebugPanel() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const feed = useFeedStore((s) => ({ len: s.items.length, error: s.error }));

  if (!open) return (
    <button className="fixed right-3 bottom-3 z-50 btn" onClick={() => setOpen(true)}>Debug</button>
  );

  return (
    <div className="fixed right-3 bottom-3 z-50 bg-black/80 text-white p-3 rounded-md w-80">
      <div className="flex justify-between mb-2">
        <strong>Debug</strong>
        <button className="btn" onClick={() => setOpen(false)}>Close</button>
      </div>
      <div className="text-xs">
        <div><strong>Auth.user:</strong></div>
        <pre className="whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
        <div><strong>Feed:</strong> items={feed.len} error={String(feed.error)}</div>
      </div>
    </div>
  );
}
