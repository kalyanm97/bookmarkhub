'use client';
import { useAuthStore } from '../../../stores/auth.store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../components/ui/Card';
import ErrorCard from '../../../components/ErrorCard';
import { useToast } from '../../../components/ui/Toast';

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();
  const toast = (() => { try { return useToast(); } catch (e) { return { push: (..._args: unknown[]) => { void _args; /* noop */ } } as const; } })();

  // clear previous auth error when this page mounts
  useEffect(() => {
    try {
      clearError && clearError();
    } catch (e) { // eslint-disable-next-line no-console
      if (process.env.NODE_ENV !== 'production') console.debug('[register.page] clearError failed', e);
    }
  }, [clearError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // client-side validation
    if (!email.trim() || !password.trim()) {
      setPasswordError('Email and password are required');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(email.trim(), password, username?.trim() || undefined);
      router.push('/');
  try { toast.push({ type: 'success', message: 'Account created' }); } catch (e) { // eslint-disable-next-line no-console
    if (process.env.NODE_ENV !== 'production') console.debug('[register.page] toast.push success failed', e);
  }
    } catch (err: unknown) {
  const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as unknown as { message?: unknown }).message ?? 'Registration failed') : String(err ?? 'Registration failed');
  setPasswordError(msg);
  try { toast.push({ type: 'error', message: msg }); } catch (e) { // eslint-disable-next-line no-console
    if (process.env.NODE_ENV !== 'production') console.debug('[register.page] toast.push error failed', e);
  }
    }
  }

  return (
    <Card className="mx-auto mt-16 max-w-[520px]">
      <h3 className="text-lg font-semibold mb-4">Register</h3>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">
          <input
            className="input input-bordered w-full"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input input-bordered w-full"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="input input-bordered w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              const v = e.target.value;
              setPassword(v);
              if (v.length < 6) setPasswordError('Password must be at least 6 characters');
              else setPasswordError(null);
            }}
          />
          {passwordError && <div className="text-error">{passwordError}</div>}
          {error && <ErrorCard title="Registration error" message={error} />}
          <div className="flex justify-end">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Registering…' : 'Create account'}
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}
