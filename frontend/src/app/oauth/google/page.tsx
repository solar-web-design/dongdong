'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { AuthResponse } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      router.replace('/login');
      return;
    }

    api<AuthResponse & { isNewUser: boolean }>('/auth/oauth/google', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
      .then((data) => {
        login(data.user, data.accessToken, data.refreshToken);
        router.replace(data.isNewUser ? '/settings' : '/feed');
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
