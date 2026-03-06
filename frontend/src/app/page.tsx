'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || 'http://localhost:3000/oauth/kakao')}&response_type=code`;
const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/google')}&response_type=code&scope=email%20profile`;

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/feed');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">동동</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-12">동문 네트워크</p>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-semibold leading-snug">
            대학 동문을 위한
            <br />
            소통 플랫폼
          </h2>
        </div>

        <div className="space-y-3">
          <a href={KAKAO_AUTH_URL} className="btn-kakao w-full block text-center">카카오 로그인</a>
          <a href={GOOGLE_AUTH_URL} className="btn-google w-full block text-center">Google 로그인</a>
          <Link href="/login" className="btn-secondary w-full block text-center">
            이메일 로그인
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-400 dark:text-gray-500">아직 회원이 아니신가요? </span>
          <Link href="/register" className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:underline">
            가입 신청
          </Link>
        </div>
      </div>
    </div>
  );
}
