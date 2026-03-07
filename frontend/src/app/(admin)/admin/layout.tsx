'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      router.replace('/feed');
    }
  }, [user, router]);

  if (!user?.isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">접근 권한이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
          <span className="text-lg font-bold">동동 Super Admin</span>
          <button onClick={() => router.push('/feed')} className="text-sm text-gray-500 hover:text-gray-700">
            사이트로 이동
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
}
