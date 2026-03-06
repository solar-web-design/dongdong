'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { User } from '@/types';

export default function ApprovalsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: () => api<{ data: User[] }>('/users/pending'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api(`/users/${id}/approve`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pendingUsers'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api(`/users/${id}/reject`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pendingUsers'] }),
  });

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">가입 승인 관리</h1>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <EmptyState title="대기 중인 신청이 없습니다" />
      ) : (
        <div className="space-y-3">
          {data.data.map((user) => (
            <div key={user.id} className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={user.profileImage} name={user.name} size="md" />
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-0.5 mb-3">
                <p>
                  {user.department && `${user.department} `}
                  {user.admissionYear && `'${String(user.admissionYear).slice(2)}`}
                  {user.studentId && ` · 학번: ${user.studentId}`}
                </p>
                <p>신청일: {formatDate(user.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => approveMutation.mutate(user.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700"
                >
                  <Check size={16} /> 승인
                </button>
                <button
                  onClick={() => rejectMutation.mutate(user.id)}
                  disabled={rejectMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50"
                >
                  <X size={16} /> 거절
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
