'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, X, Flag } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { Report } from '@/types';

const REASON_LABELS: Record<string, string> = {
  SPAM: '스팸/광고',
  ABUSE: '욕설/비방',
  HARASSMENT: '괴롭힘/성희롱',
  FALSE_INFO: '허위 정보',
  INAPPROPRIATE: '부적절한 콘텐츠',
  OTHER: '기타',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기', color: 'bg-yellow-100 text-yellow-700' },
  RESOLVED: { label: '처리완료', color: 'bg-green-100 text-green-700' },
  DISMISSED: { label: '반려', color: 'bg-gray-100 text-gray-600' },
};

export default function AdminReportsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api<{ data: Report[] }>('/reports'),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api(`/reports/${id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">신고 관리</h1>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <EmptyState title="신고 내역이 없습니다" />
      ) : (
        <div className="space-y-3">
          {data.data.map((report) => (
            <div key={report.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flag size={16} className="text-red-500" />
                  <span className="text-sm font-semibold">
                    {report.type === 'POST' ? '게시글' : '댓글'} 신고
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[report.status]?.color}`}>
                  {STATUS_LABELS[report.status]?.label}
                </span>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                <p>사유: <span className="font-medium text-gray-700 dark:text-gray-300">{REASON_LABELS[report.reason]}</span></p>
                {report.description && <p>상세: {report.description}</p>}
                <p>신고자: {report.reporter?.name || '알 수 없음'}</p>
                {report.target && (
                  <p className="truncate">
                    대상: {report.target.title || report.target.content?.slice(0, 50)}
                    {report.target.author && ` (작성자: ${report.target.author.name})`}
                  </p>
                )}
                <p>신고일: {formatDate(report.createdAt)}</p>
              </div>

              {report.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => resolveMutation.mutate({ id: report.id, action: 'RESOLVED' })}
                    disabled={resolveMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
                  >
                    <Check size={16} /> 삭제 처리
                  </button>
                  <button
                    onClick={() => resolveMutation.mutate({ id: report.id, action: 'DISMISSED' })}
                    disabled={resolveMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <X size={16} /> 반려
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
