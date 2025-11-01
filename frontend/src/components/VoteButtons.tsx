'use client';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from './ui/Toast';
import { useAuthStore } from '../stores/auth.store';
import { useFeedStore } from '../stores/bookmarks.store';
import type { VoteRespDTO } from '../types/shared';

export default function VoteButtons({
  id,
  upCount: initialUp = 0,
  downCount: initialDown = 0,
  my = 0,
  disabled,
}: {
  id: string;
  upCount?: number;
  downCount?: number;
  my?: -1 | 0 | 1;
  disabled?: boolean;
}) {
  const { user } = useAuthStore();
  const [up, setUp] = useState(initialUp);
  const [down, setDown] = useState(initialDown);
  const [mine, setMine] = useState<-1 | 0 | 1>(my);
  const [hover, setHover] = useState(false);
  const [sending, setSending] = useState(false);
  const toast = (() => {
    try {
      return useToast();
    } catch (e) {
          return { push: (..._args: unknown[]) => { void _args; } } as const;
    }
  })();
  
  useEffect(() => {
    setUp(initialUp);
  }, [initialUp, id]);
  useEffect(() => {
    setDown(initialDown);
  }, [initialDown, id]);
  useEffect(() => {
    setMine(my);
  }, [my, id]);

  function applyOptimistic(prev: -1 | 0 | 1, next: -1 | 0 | 1) {
    let nu = up;
    let nd = down;
    if (prev === 0 && next === 1) nu = up + 1;
    else if (prev === 0 && next === -1) nd = down + 1;
    else if (prev === 1 && next === 0) nu = Math.max(0, up - 1);
    else if (prev === -1 && next === 0) nd = Math.max(0, down - 1);
    else if (prev === 1 && next === -1) { nu = Math.max(0, up - 1); nd = down + 1; }
    else if (prev === -1 && next === 1) { nd = Math.max(0, down - 1); nu = up + 1; }
    return { nu, nd };
  }

  async function send(value: -1 | 0 | 1) {
    if (!user || disabled) return;
    if (sending) return;
    setSending(true);
    const prev = mine;
    const prevUp = up;
    const prevDown = down;
    const optimistic = applyOptimistic(prev, value);
    const updateItemCounts = useFeedStore.getState().updateItemCounts;
    setMine(value);
    setUp(optimistic.nu);
    setDown(optimistic.nd);
    updateItemCounts(id, optimistic.nu, optimistic.nd, value);

    try {
  const res = await api<VoteRespDTO>(`/votes/bookmark/${id}`, {
        method: 'POST',
        body: JSON.stringify({ value }),
      });
      setUp(res.upCount);
      setDown(res.downCount);
      setMine(res.userVote);
      updateItemCounts(id, res.upCount, res.downCount, res.userVote);
          try { toast.push({ type: 'success', message: 'Vote saved' }); } catch (e) { void e; }
    } catch (e) {
      setMine(prev);
      setUp(prevUp);
      setDown(prevDown);
      updateItemCounts(id, prevUp, prevDown, prev);
  try { toast.push({ type: 'error', message: 'Failed to save vote' }); } catch (e) { void e; }
    } finally {
      setSending(false);
    }
  }

  const btnClass = (active: boolean, type: 'up' | 'down') => {
    const activeColor = active ? (type === 'up' ? 'text-green-400' : 'text-red-400') : 'text-zinc-300';
    return `inline-flex items-center justify-center h-10 w-10 sm:h-6 sm:w-6 rounded bg-zinc-800 ${activeColor} p-0 vote-transition`;
  };

  return (
    <div
      className="inline-flex flex-row items-center gap-2 relative whitespace-nowrap"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!user && hover ? (
        <div className="absolute -top-6 left-0 text-sm opacity-90 bg-black/70 rounded px-1 z-50">🚫</div>
      ) : null}

  <button
    title={user ? 'Upvote' : 'Log in to vote'}
    disabled={!user || disabled || sending}
    aria-pressed={!!user && mine === 1}
  className={btnClass(!!user && mine === 1, 'up')}
    onClick={() => send(mine === 1 ? 0 : 1)}
    type="button"
  >▲</button>
  <div className="text-sm select-none">{up}</div>

  <button
    title={user ? 'Downvote' : 'Log in to vote'}
    disabled={!user || disabled || sending}
    aria-pressed={!!user && mine === -1}
  className={btnClass(!!user && mine === -1, 'down')}
    onClick={() => send(mine === -1 ? 0 : -1)}
    type="button"
  >▼</button>
  <div className="text-sm select-none">{down}</div>
    </div>
  );
}