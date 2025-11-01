"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';
import Skeleton from './ui/Skeleton';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const checking = useAuthStore((s) => s.loading ?? false);
  const router = useRouter();

  useEffect(() => {
    if (!checking && user == null) {
      router.replace('/login');
    }
  }, [checking, user, router]);

  if (checking || user == null) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
