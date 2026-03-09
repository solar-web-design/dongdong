'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, FileText, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/super-admin', label: '대시보드', icon: Building2, exact: true },
  { href: '/super-admin/tenant-requests', label: '개설 신청', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  // 상세 페이지인지 확인 (tenants/[id] 등)
  const isDetailPage = pathname.includes('/tenants/') && pathname !== '/super-admin/tenants/new';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* 상단 바 */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              {isDetailPage && (
                <button onClick={() => router.push('/super-admin')} className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ArrowLeft size={20} />
                </button>
              )}
              <span className="text-lg font-bold">동동 Super Admin</span>
            </div>
            <button onClick={() => router.push('/feed')} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              사이트로 이동
            </button>
          </div>
          {/* 네비게이션 탭 */}
          {!isDetailPage && (
            <nav className="flex gap-1 -mb-px overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                      isActive
                        ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
}
