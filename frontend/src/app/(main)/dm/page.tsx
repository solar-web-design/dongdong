'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Mail, Send, PenSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatRelativeTime, cn } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { DirectMessage, CursorResponse } from '@/types';

type Tab = 'received' | 'sent';

export default function DMListPage() {
  const [tab, setTab] = useState<Tab>('received');
  const { user } = useAuthStore();

  const { data: received, isLoading: loadingReceived } = useQuery({
    queryKey: ['dm', 'received', user?.id],
    queryFn: () => api<CursorResponse<DirectMessage>>('/dm/received', { params: { limit: 50 } }),
    enabled: !!user,
  });

  const { data: sent, isLoading: loadingSent } = useQuery({
    queryKey: ['dm', 'sent', user?.id],
    queryFn: () => api<CursorResponse<DirectMessage>>('/dm/sent', { params: { limit: 50 } }),
    enabled: tab === 'sent' && !!user,
  });

  const letters = tab === 'received' ? received?.data : sent?.data;
  const isLoading = tab === 'received' ? loadingReceived : loadingSent;

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">편지함</h1>
        <Link
          href="/dm/write"
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white backdrop-blur-md"
        >
          <PenSquare size={16} />
          편지 쓰기
        </Link>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setTab('received')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
            tab === 'received'
              ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          )}
        >
          <Mail size={16} />
          받은 편지
        </button>
        <button
          onClick={() => setTab('sent')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
            tab === 'sent'
              ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          )}
        >
          <Send size={16} />
          보낸 편지
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !letters?.length ? (
        <EmptyState
          title={tab === 'received' ? '받은 편지가 없습니다' : '보낸 편지가 없습니다'}
          description={tab === 'received' ? '동문에게 편지를 받아보세요!' : '동문에게 편지를 보내보세요!'}
        />
      ) : (
        <div className="space-y-2">
          {letters.map((letter) => {
            const person = tab === 'received' ? letter.sender : letter.receiver;
            return (
              <Link
                key={letter.id}
                href={`/dm/${letter.id}`}
                className={cn(
                  'block p-4 rounded-xl border transition-colors',
                  !letter.isRead && tab === 'received'
                    ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800/50'
                    : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar src={person?.profileImage} name={person?.name || ''} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                          {tab === 'received' ? 'From' : 'To'}
                        </span>
                        <span className="font-medium text-sm">{person?.name}</span>
                        {!letter.isRead && tab === 'received' && (
                          <span className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white" />
                        )}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        {formatRelativeTime(letter.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {letter.title || '(제목 없음)'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {letter.content}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
