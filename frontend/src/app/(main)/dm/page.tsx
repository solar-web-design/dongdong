'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { User, DirectMessage } from '@/types';

interface DMConversation {
  user: User;
  lastMessage: DirectMessage;
  unreadCount: number;
}

export default function DMListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dmList'],
    queryFn: () => api<{ data: DMConversation[] }>('/dm'),
  });

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">다이렉트 메시지</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <EmptyState title="DM이 없습니다" description="회원 프로필에서 DM을 보내보세요!" />
      ) : (
        <div className="space-y-1">
          {data.data.map((conv) => (
            <Link
              key={conv.user.id}
              href={`/dm/${conv.user.id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Avatar src={conv.user.profileImage} name={conv.user.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{conv.user.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatRelativeTime(conv.lastMessage.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage.content}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
