'use client';
import { create } from 'zustand';
import { api } from '../lib/api';
import { useAuthStore } from './auth.store';
import { extractErrorMessage } from '../lib/utils';

const PERSIST_KEY = 'bookmarkhub.votes.v1';
function persistedKeyForUser() {
  try {
    if (typeof window === 'undefined') return PERSIST_KEY;
    const u = useAuthStore.getState().user;
    return u && u.id ? `${PERSIST_KEY}.${u.id}` : `${PERSIST_KEY}.anon`;
  } catch {
    return `${PERSIST_KEY}.anon`;
  }
}
function readPersistedVotes(): Record<string, -1 | 0 | 1> {
  try {
    if (typeof window === 'undefined') return {};
    const key = persistedKeyForUser();
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}
function writePersistedVotes(map: Record<string, -1 | 0 | 1>) {
  try {
    if (typeof window === 'undefined') return;
    const key = persistedKeyForUser();
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) { void e; }
}

export type FeedItem = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  postedBy: {
    id: string;
    email: string | null;
    displayName: string | null;
    username: string | null;
  };
  voteCount: number;
  upCount?: number;
  downCount?: number;
  userVote: -1 | 0 | 1;
};

interface FeedState {
  items: FeedItem[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  startLive: () => void;
  stopLive: () => void;
  create: (title: string, url: string) => Promise<void>;
  updateItemCounts: (bookmarkId: string, upCount: number, downCount: number, userVote: -1 | 0 | 1) => void;
  clearUserVotes: () => void;
  updateItem: (bookmarkId: string, patch: Partial<FeedItem>) => void;
  _timer?: ReturnType<typeof setInterval> | undefined;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  async fetch() {
    set({ loading: true, error: null });
    try {
      const data = await api<FeedItem[]>('/bookmarks');
      const raw = readPersistedVotes();
      const currentUser = useAuthStore.getState().user;
      const merged = data.map((it) => {
        const persisted = raw[it.id] as number | undefined;
        let uv: -1 | 0 | 1 = (it.userVote ?? 0) as -1 | 0 | 1;
        if (currentUser && currentUser.id) {
          if (uv === 0 && typeof persisted === 'number' && persisted !== 0) uv = persisted as -1 | 0 | 1;
        } else {
          uv = (typeof persisted === 'number' ? persisted : uv) as -1 | 0 | 1;
        }
        return { ...it, userVote: uv };
      });
      set({ items: merged });
    } catch (e: unknown) {
      const msg = extractErrorMessage(e, 'Failed to load feed');
      set({ error: msg });
      try { // eslint-disable-next-line no-console
          if (String(process.env.NODE_ENV) !== 'production') console.debug('[bookmarks.store] fetch failed', e);
      } catch { void 0; }
    } finally {
      set({ loading: false });
    }
  },

  startLive() {
    const t = get()._timer;
    if (t) return;
    const timer = setInterval(() => get().fetch(), 10_000);
    set({ _timer: timer });
  },

  stopLive() {
    const t = get()._timer;
    if (t) {
      clearInterval(t);
      set({ _timer: undefined });
    }
  },

  async create(title, url) {
    const temp: FeedItem = {
      id: `tmp-${Date.now()}`,
      title,
      url,
      createdAt: new Date().toISOString(),
      postedBy: { id: '', email: 'you', displayName: null, username: null },
      voteCount: 0,
      upCount: 0,
      downCount: 0,
      userVote: 0,
    };
    set({ items: [temp, ...get().items] });

    try {
      const real = await api<FeedItem>('/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ title, url }),
      });
      set({ items: get().items.map((x) => (x.id === temp.id ? real : x)) });
    } catch (e: unknown) {
      set({ items: get().items.filter((x) => x.id !== temp.id) });
      try { // eslint-disable-next-line no-console
            if (String(process.env.NODE_ENV) !== 'production') console.debug('[bookmarks.store] create failed', e);
      } catch { void 0; }
      throw e;
    }
  },

  updateItemCounts(bookmarkId: string, upCount: number, downCount: number, userVote: -1 | 0 | 1) {
    set({ items: get().items.map((it) => (it.id === bookmarkId ? { ...it, upCount, downCount, userVote } : it)) });
    try {
      const map = readPersistedVotes();
      if (userVote === 0) delete map[bookmarkId];
      else map[bookmarkId] = userVote;
      writePersistedVotes(map);
    } catch (e) { try { // eslint-disable-next-line no-console
          if (String(process.env.NODE_ENV) !== 'production') console.debug('[bookmarks.store] updateItemCounts persist failed', e);
    } catch { void 0; } }
  },
  clearUserVotes() {
    try {
      try { localStorage.removeItem(persistedKeyForUser()); } catch (e) { try { // eslint-disable-next-line no-console
            if (String(process.env.NODE_ENV) !== 'production') console.debug('[bookmarks.store] clearUserVotes localStorage remove failed', e);
      } catch { void 0; } }
      try { localStorage.removeItem(`${PERSIST_KEY}.anon`); } catch (e) { try { // eslint-disable-next-line no-console
            if (String(process.env.NODE_ENV) !== 'production') console.debug('[bookmarks.store] clearUserVotes localStorage remove anon failed', e);
      } catch { void 0; } }
    } catch (e) { void e; }
    set({ items: get().items.map((it) => ({ ...it, userVote: 0 as -1 | 0 | 1 })) });
  },
  updateItem(bookmarkId: string, patch: Partial<FeedItem>) {
    set({ items: get().items.map((it) => (it.id === bookmarkId ? { ...it, ...patch } : it)) });
  },
}));