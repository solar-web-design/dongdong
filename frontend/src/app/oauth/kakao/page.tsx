'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { AuthResponse } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      router.replace('/login');
      return;
    }

    api<AuthResponse & { isNewUser: boolean }>('/auth/oauth/kakao', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
      .then((data) => {
        login(data.user);
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

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <KakaoCallbackContent />
    </Suspense>
  );
}
