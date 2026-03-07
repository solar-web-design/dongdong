'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserCheck, Users, FileText, Megaphone, Flag } from 'lucide-react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { User, Report } from '@/types';

export default function AdminPage() {
  const { data: pending, isLoading } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: () => api<{ data: User[] }>('/users/pending'),
  });

  const { data: reports } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api<{ data: Report[] }>('/reports'),
  });

  const pendingReports = reports?.data.filter((r) => r.status === 'PENDING').length || 0;

  if (isLoading) return <LoadingSpinner />;

  const menuItems = [
    { href: '/admin/approvals', label: '가입 승인 관리', icon: UserCheck, badge: pending?.data.length },
    { href: '/admin/members', label: '회원 역할 관리', icon: Users },
    { href: '/admin/posts', label: '게시글 관리', icon: FileText },
    { href: '/admin/announcements', label: '공지사항 관리', icon: Megaphone },
    { href: '/admin/reports', label: '신고 관리', icon: Flag, badge: pendingReports },
  ];

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-6">관리</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{pending?.data.length || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">가입 대기</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">-</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">전체 회원</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{pendingReports}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">신고 대기</div>
        </div>
      </div>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="card flex items-center gap-3 p-4 hover:shadow-md transition-shadow"
            >
              <Icon size={20} className="text-gray-500 dark:text-gray-400" />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge ? (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
