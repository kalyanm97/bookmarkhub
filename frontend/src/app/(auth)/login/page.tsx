'use client';
import { useAuthStore } from '../../../stores/auth.store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../components/ui/Card';
import ErrorCard from '../../../components/ErrorCard';
import { useToast } from '../../../components/ui/Toast';
export default function LoginPage() {
	const { login, loading, error, clearError } = useAuthStore();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [localError, setLocalError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const router = useRouter();
	const toast = (() => { try { return useToast(); } catch (e) { return { push: (..._args: unknown[]) => { void _args; /* noop */ } } as const; } })();

		useEffect(() => {
			try { clearError && clearError(); } catch (e) { // eslint-disable-next-line no-console
				if (process.env.NODE_ENV !== 'production') console.debug('[login.page] clearError failed', e);
			}
		}, [clearError]);

	async function handleLogin() {
		setLocalError(null);
		if (!email.trim() || !password.trim()) {
			setLocalError('Identifier (email or username) and password are required');
			return;
		}
		try {
			await login(email.trim(), password);
			router.push('/');
			try { toast.push({ type: 'success', message: 'Logged in' }); } catch (e) { // eslint-disable-next-line no-console
				if (process.env.NODE_ENV !== 'production') console.debug('[login.page] toast.push success failed', e);
			}
		} catch (err: unknown) {
			// auth store surfaces server error in `error` as well
			const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as unknown as { message?: unknown }).message ?? 'Login failed') : String(err ?? 'Login failed');
			setLocalError(msg);
			try { toast.push({ type: 'error', message: msg }); } catch (e) { // eslint-disable-next-line no-console
				if (process.env.NODE_ENV !== 'production') console.debug('[login.page] toast.push error failed', e);
			}
			try {
				if (process.env.NODE_ENV !== 'production') {
					// eslint-disable-next-line no-console
					console.error('login failed', msg);
				}
			} catch (err) { // eslint-disable-next-line no-console
				if (process.env.NODE_ENV !== 'production') console.debug('[login.page] console.error failed', err);
			}
		}
	}

	return (
			<Card className="mx-auto mt-16 max-w-[520px]">
				<h3 className="text-lg font-semibold mb-4">Login</h3>
				<div className="flex flex-col gap-3">
					<input
						className="input input-bordered w-full"
						placeholder="Email or username"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							if (!e.target.value.trim()) setEmailError('Required'); else setEmailError(null);
						}}
						/>
					{emailError && <div className="text-error">{emailError}</div>}
				<input
					className="input input-bordered w-full"
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			{/* Show a single error message preferring local validation, then server error */}
			{(localError || error) && <div className="mt-2"><ErrorCard title="Login failed" message={localError ?? error} /></div>}
						<div className="flex justify-end">
							<button className="btn btn-primary" disabled={loading || !!emailError} onClick={handleLogin}>
								{loading ? 'Logging in…' : 'Login'}
							</button>
						</div>
					</div>
				</Card>
	);
}
