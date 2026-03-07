'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatRelativeTime } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api<{ data: Notification[]; unreadCount: number }>('/notifications', { params: { limit: 50 } }),
  });

  const readAllMutation = useMutation({
    mutationFn: () => api('/notifications/read-all', { method: 'PATCH' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); queryClient.invalidateQueries({ queryKey: ['notifications-count'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/notifications/${id}`, { method: 'DELETE' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); queryClient.invalidateQueries({ queryKey: ['notifications-count'] }); },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => api('/notifications', { method: 'DELETE' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); queryClient.invalidateQueries({ queryKey: ['notifications-count'] }); },
  });

  const handleClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await api(`/notifications/${notification.id}/read`, { method: 'PATCH' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] }); queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    }
    if (notification.link) router.push(notification.link);
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">알림</h1>
        <div className="flex gap-3">
          {data?.unreadCount ? (
            <button
              onClick={() => readAllMutation.mutate()}
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              전체 읽음
            </button>
          ) : null}
          {data?.data.length ? (
            <button
              onClick={() => { if (confirm('모든 알림을 삭제하시겠습니까?')) deleteAllMutation.mutate(); }}
              className="text-sm text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              전체 삭제
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <EmptyState icon={<Bell size={48} />} title="알림이 없습니다" />
      ) : (
        <div className="space-y-1">
          {data.data.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                'w-full text-left p-3 rounded-xl transition-colors',
                n.isRead ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
              )}
            >
              <div className="flex items-start gap-3">
                {!n.isRead && <div className="w-2 h-2 bg-gray-900 dark:bg-white rounded-full mt-1.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !n.isRead && 'font-medium')}>{n.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                  className="p-1 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
