'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users, User } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { ChatRoom } from '@/types';

export default function ChatListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => api<{ data: ChatRoom[] }>('/chat/rooms'),
  });

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">채팅</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <EmptyState title="채팅방이 없습니다" description="새 채팅을 시작해보세요!" />
      ) : (
        <div className="space-y-1">
          {data.data.map((room) => (
            <Link
              key={room.id}
              href={`/chat/${room.id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                {room.type === 'GROUP' ? <Users size={20} className="text-gray-500 dark:text-gray-400" /> : <User size={20} className="text-gray-500 dark:text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">
                    {room.name || '채팅방'}
                    {room.type === 'GROUP' && room.members && (
                      <span className="text-gray-400 dark:text-gray-500 ml-1">{room.members.length}</span>
                    )}
                  </span>
                  {room.lastMessage && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatRelativeTime(room.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {room.lastMessage?.content || '메시지가 없습니다'}
                </p>
              </div>
              {room.unreadCount ? (
                <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {room.unreadCount > 9 ? '9+' : room.unreadCount}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/chat/new"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors z-40"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
