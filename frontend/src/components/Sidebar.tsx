'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText, Users, MessageCircle, Mail, Wallet, Bell,
  Megaphone, Settings, ShieldCheck, User, Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';

const menuItems = [
  { href: '/feed', label: '피드', icon: FileText },
  { href: '/meetings', label: '모임', icon: Users },
  { href: '/chat', label: '채팅', icon: MessageCircle },
  { href: '/dm', label: '편지함', icon: Mail },
  { href: '/finance', label: '회비', icon: Wallet },
  { href: '/members', label: '동문 찾기', icon: User },
  { href: '/announcements', label: '공지사항', icon: Megaphone },
  { href: '/notifications', label: '알림', icon: Bell },
  { href: '/settings', label: '설정', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'PRESIDENT' || user?.role === 'VICE_PRESIDENT' || user?.isSuperAdmin;

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 border-r border-gray-200/40 dark:border-gray-700/40 bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl p-4">
      <Link href="/feed" className="text-2xl font-bold tracking-tight mb-8 px-3">
        동동
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white backdrop-blur-md shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-900/5 dark:hover:bg-white/5'
              )}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white backdrop-blur-md shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-900/5 dark:hover:bg-white/5'
            )}
          >
            <ShieldCheck size={20} />
            관리
          </Link>
        )}
        {user?.isSuperAdmin && (
          <Link
            href="/super-admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname.startsWith('/super-admin')
                ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 shadow-sm'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
            )}
          >
            <Crown size={20} />
            플랫폼 관리
          </Link>
        )}
      </nav>
    </aside>
  );
}
