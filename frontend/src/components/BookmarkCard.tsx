'use client';

import useRelativeTime from '../lib/useRelativeTime';
import { type FeedItem } from '../stores/bookmarks.store';
import VoteButtons from './VoteButtons';
import Skeleton from './ui/Skeleton';

export default function BookmarkCard({ item }: { item: FeedItem }) {
  const rel = useRelativeTime(item.createdAt);
  const poster =
    item.postedBy?.username ??
    item.postedBy?.email ??
    item.postedBy?.displayName ??
    'unknown';

  return (
    <div className="animate-fade-in">
    <div
      className="
        min-h-[6rem] w-full rounded-lg bg-zinc-900/60 border border-zinc-800 px-4 py-3
        transition-transform duration-150 will-change-transform
        hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:ring-1 hover:ring-zinc-700
      "
      role="group"
    >
      <div className="flex h-full items-center justify-between gap-4">
        {/* Left: title + meta */}
        <div className="min-w-0 flex-1">
          <div className="min-h-[2.4rem]">
            {item.title ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                title={item.title}
                className="block truncate text-lg font-medium text-blue-400 group-hover:underline"
              >
                {item.title}
              </a>
            ) : (
              <Skeleton className="h-6 w-3/4" fade />
            )}
          </div>

          <div className="mt-1 min-h-[1rem] truncate text-xs opacity-70">
            {rel ? (
              <>{`posted ${rel} · posted by `}<span className="font-medium">{poster}</span></>
            ) : (
              <Skeleton className="h-3 w-1/2" fade />
            )}
          </div>
        </div>

        {/* Right: score + votes */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-1 rounded-md bg-zinc-800 text-sm font-medium" aria-label="net-score">
            {(item.upCount ?? 0) - (item.downCount ?? 0)}
          </span>
      <VoteButtons id={item.id} upCount={item.upCount ?? 0} downCount={item.downCount ?? 0} my={item.userVote} />
        </div>
      </div>
    </div>
    </div>
  );
}