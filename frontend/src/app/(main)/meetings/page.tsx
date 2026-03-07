'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, MapPin, Users, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatDateTime, formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { Meeting, PaginatedResponse } from '@/types';

const tabs = [
  { value: 'UPCOMING', label: '예정' },
  { value: 'ONGOING', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
];

export default function MeetingsPage() {
  const [status, setStatus] = useState('UPCOMING');

  const { data, isLoading } = useQuery({
    queryKey: ['meetings', status],
    queryFn: () =>
      api<PaginatedResponse<Meeting>>('/meetings', {
        params: { status, limit: 20 },
      }),
  });

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">모임</h1>

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium',
              status === tab.value ? 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white backdrop-blur-md' : 'bg-gray-100/60 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <EmptyState title="모임이 없습니다" description="새로운 모임을 만들어보세요!" />
      ) : (
        <div className="space-y-3">
          {data.data.map((meeting) => (
            <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="card block p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-3">{meeting.title}</h3>
              <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {formatDateTime(meeting.date)}
                </div>
                {meeting.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    {meeting.location}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  {meeting.memberCount || 0}
                  {meeting.maxMembers && `/${meeting.maxMembers}`}명
                </div>
                {meeting.fee > 0 && (
                  <div className="flex items-center gap-2">
                    <Wallet size={14} />
                    참가비 {formatCurrency(meeting.fee)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/meetings/create"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white backdrop-blur-xl border border-gray-200/40 dark:border-gray-700/40 rounded-full flex items-center justify-center shadow-lg hover:bg-white/90 dark:hover:bg-gray-900/90 transition-colors z-40"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
