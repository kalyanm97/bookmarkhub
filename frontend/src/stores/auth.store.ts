"use client";
import { create } from 'zustand';
import { api } from '../lib/api';
import { extractErrorMessage } from '../lib/utils';
import type { UserDTO } from '../types/shared';

interface AuthState {
  user: UserDTO | null;
  loading: boolean;
  error: string | null;
  login: (e: string, p: string) => Promise<void>;
  register: (e: string, p: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: UserDTO | null) => void;
  updateProfile: (payload: { displayName?: string; username?: string; id: string }) => Promise<UserDTO | null>;
  refreshMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  async login(identifier, password) {
    set({ loading: true, error: null });
    try {
      const res = await api<{ user: UserDTO }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      set({ user: res.user });
      try {
        (await import('../stores/bookmarks.store')).useFeedStore.getState().fetch();
      } catch (e) {
        try {
          // eslint-disable-next-line no-console
            if (String(process.env.NODE_ENV) !== 'production') console.debug('[auth.store] fetch feed failed', e);
        } catch { void 0; }
      }
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Login failed');
      set({ error: msg });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  async register(email, password, username) {
    set({ loading: true, error: null });
    try {
      const res = await api<{ user: UserDTO }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      });
      set({ user: res.user });
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Registration failed');
      set({ error: msg });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  async logout() {
  await api('/auth/logout', { method: 'POST', body: JSON.stringify({}) });
  try { useAuthStore.setState({ user: null }); } catch (e) { try { // eslint-disable-next-line no-console
      if (String(process.env.NODE_ENV) !== 'production') console.debug('[auth.store] setState failed', e); } catch { void 0; } }
  try {
    (await import('../stores/bookmarks.store')).useFeedStore.getState().fetch();
  } catch (e) {
    try { // eslint-disable-next-line no-console
        if (String(process.env.NODE_ENV) !== 'production') console.debug('[auth.store] fetch feed failed', e); } catch { void 0; }
  }
  },

  setUser(u) { set({ user: u }); },

  clearError() { set({ error: null }); },

  async updateProfile(payload: { displayName?: string; username?: string; id: string }) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[auth.store] updateProfile payload ->', payload);
      }
  } catch (e) { // eslint-disable-next-line no-console
    if (String(process.env.NODE_ENV) !== 'production') console.debug('[auth.store] updateProfile debug log failed', e);
  }
      const res = await api<UserDTO>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
  const prev = get().user;
  const merged = { ...(prev || {}), ...(res || {}) } as UserDTO;
  set({ user: merged });
  return merged;
  },


  async refreshMe() {
    try {
      const me = await api<UserDTO>('/auth/me');
      if (me?.id) set({ user: me });
      else set({ user: null });
    } catch (e) {
      set({ user: null });
      try { // eslint-disable-next-line no-console
    if (String(process.env.NODE_ENV) !== 'production') console.debug('[auth.store] refreshMe failed', e);
      } catch { void 0; }
    }
  },
}));