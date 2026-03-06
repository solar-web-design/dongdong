'use client';

import { useQuery } from '@tanstack/react-query';
import { Pin, Megaphone } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { Announcement, PaginatedResponse } from '@/types';

export default function AnnouncementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api<PaginatedResponse<Announcement>>('/announcements', { params: { limit: 50 } }),
  });

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">공지사항</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <EmptyState icon={<Megaphone size={48} />} title="공지사항이 없습니다" />
      ) : (
        <div className="space-y-3">
          {data.data.map((ann) => (
            <div key={ann.id} className="card p-4">
              {ann.isPinned && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium mb-2">
                  <Pin size={12} /> 고정
                </div>
              )}
              <h3 className="font-semibold mb-2">{ann.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{ann.content}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500">
                <Avatar src={ann.author.profileImage} name={ann.author.name} size="sm" />
                <span>{ann.author.name}</span>
                <span>·</span>
                <span>{formatRelativeTime(ann.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
