'use client';

import Link from 'next/link';
import { User, Search, Megaphone, Bell, Settings, ShieldCheck, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { getRoleBadge } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import { api } from '@/lib/api';

const menuItems = [
  { href: '/settings', label: '내 프로필', icon: User },
  { href: '/members', label: '동문 찾기', icon: Search },
  { href: '/announcements', label: '공지사항', icon: Megaphone },
  { href: '/notifications', label: '알림', icon: Bell },
  { href: '/dm', label: '다이렉트 메시지', icon: Bell },
  { href: '/settings', label: '설정', icon: Settings },
];

export default function MorePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === 'PRESIDENT' || user?.role === 'VICE_PRESIDENT';
  const role = user ? getRoleBadge(user.role) : null;

  const handleLogout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    logout();
    router.push('/');
  };

  return (
    <div className="px-4 py-4">
      {/* Profile Card */}
      {user && (
        <Link href="/settings" className="card flex items-center gap-4 p-4 mb-6 hover:shadow-md transition-shadow">
          <Avatar src={user.profileImage} name={user.name} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{user.name}</span>
              {role && user.role !== 'MEMBER' && <Badge className={role.color}>{role.label}</Badge>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <ChevronRight size={20} className="text-gray-300 dark:text-gray-600" />
        </Link>
      )}

      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Icon size={20} className="text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-sm flex-1">{item.label}</span>
              <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ShieldCheck size={20} className="text-gray-500 dark:text-gray-400" />
            <span className="font-medium text-sm flex-1">관리자</span>
            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-left"
        >
          <LogOut size={20} className="text-red-400" />
          <span className="font-medium text-sm text-red-500">로그아웃</span>
        </button>
      </div>
    </div>
  );
}
