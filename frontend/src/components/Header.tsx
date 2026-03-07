'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell } from 'lucide-react';
import Avatar from './Avatar';
import { useAuthStore } from '@/lib/store';
import { useTenantStore } from '@/hooks/useTenant';
import { api } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tenant } = useTenantStore();

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api<{ data: unknown[]; unreadCount: number }>('/notifications', { params: { limit: 1 } }),
    refetchInterval: 30000,
    enabled: !!user,
  });

  const unreadCount = notifData?.unreadCount || 0;

  return (
    <header className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/feed" className="text-xl font-bold tracking-tight">
          {tenant ? tenant.name : '동동'}
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/members')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Search size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => router.push('/notifications')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <Link href="/settings">
            <Avatar
              src={user?.profileImage}
              name={user?.name || '?'}
              size="sm"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
