 'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import type { UserDTO } from '../../types/shared';
import { extractErrorMessage } from '../../lib/utils';
import RequireAuth from '../../components/RequireAuth';
import ErrorCard from '../../components/ErrorCard';
import { useToast } from '../../components/ui/Toast';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const toast = (() => { try { return useToast(); } catch (e) { return { push: (..._args: unknown[]) => { void _args; /* noop */ } } as const; } })();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
      setUsername(user.username ?? '');
    }
  }, [user]);

  if (!user) return (
    <RequireAuth>
      <div>{/* user required */}</div>
    </RequireAuth>
  );

  async function handleSave() {
    setServerError(null);
    try {
      if (usernameError) {
        setServerError('Please fix username errors before saving');
        return;
      }
      setSaving(true);
  const updated: UserDTO | null = await updateProfile({ displayName, username, id: user?.id??'' });
      if (updated) {
        setDisplayName(updated.displayName ?? '');
        setUsername(updated.username ?? '');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
  try { toast.push({ type: 'success', message: 'Profile updated' }); } catch (e) { // eslint-disable-next-line no-console
    if (process.env.NODE_ENV !== 'production') console.debug('[profile.page] toast.push success failed', e);
  }
    } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Failed to save profile');
    setServerError(msg);
    try { toast.push({ type: 'error', message: msg }); } catch (e) { // eslint-disable-next-line no-console
      if (process.env.NODE_ENV !== 'production') console.debug('[profile.page] toast.push error failed', e);
    }
      } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <h2>Your Profile</h2>

      <div className="max-w-[720px]">
        <label>
          Display Name
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => {
              const v = e.target.value;
              setUsername(v);
              if (v && !/^[a-z0-9_.]{3,20}$/i.test(v)) setUsernameError('username must be 3-20 chars (letters, numbers, _ or .)');
              else setUsernameError(null);
            }}
          />
          {usernameError && <div className="text-error">{usernameError}</div>}
        </label>

        <label>
          Email ID
          <input value={user.email ?? ''} readOnly />
        </label>

        <div className="flex gap-2">
          <button className="btn" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving' : 'Save'}
          </button>
          {saved && <div className="muted">Saved ✓</div>}
        </div>
  {serverError && <ErrorCard title="Profile save failed" message={serverError} onRetry={handleSave} />}
      </div>
    </div>
  );
}