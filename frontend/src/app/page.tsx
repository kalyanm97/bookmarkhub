'use client';

import { useEffect } from 'react';
import { useFeedStore } from '../stores/bookmarks.store';
import BookmarkCard from '../components/BookmarkCard';
import Skeleton from '../components/ui/Skeleton';

export default function HomePage() {
  const { items, loading, error, fetch, startLive, stopLive } = useFeedStore();

  useEffect(() => {
    fetch();           
    startLive();       
    return () => stopLive();
  }, []);

  if (loading) {
    return (
      <div className="stack">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full">
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="card mx-auto max-w-[720px] text-center">
        <div className="text-lg font-semibold">Failed to load feed</div>
        <div className="mt-2 text-sm text-zinc-400">{error}</div>
        <div className="mt-4">
          <button className="btn" onClick={() => fetch()}>Retry</button>
        </div>
      </div>
    );
  }
  if (!items.length) return <div className="card mx-auto max-w-[720px] text-center">No bookmarks.</div>;

  return (
    <div className="stack">
      {items.map((i) => (
        <BookmarkCard key={i.id} item={i} />
      ))}
    </div>
  );
}