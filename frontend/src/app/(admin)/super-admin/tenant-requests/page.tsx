'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { api } from '@/lib/api';

interface TenantRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  universityName: string;
  clubName: string;
  slug: string;
  description?: string;
  expectedMembers?: number;
  rejectReason?: string;
  createdAt: string;
}

export default function TenantRequestsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('PENDING');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tenant-requests', filter],
    queryFn: () => api<{ data: TenantRequest[] }>(`/tenant-requests${filter ? `?status=${filter}` : ''}`),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api(`/tenant-requests/${id}/approve`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api(`/tenant-requests/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-requests'] });
      setRejectId(null);
      setRejectReason('');
    },
  });

  const requests = data?.data || [];
  const statusTabs = [
    { value: 'PENDING', label: '대기', icon: Clock },
    { value: 'APPROVED', label: '승인', icon: CheckCircle },
    { value: 'REJECTED', label: '거절', icon: XCircle },
    { value: '', label: '전체', icon: Building2 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">동문회 개설 신청</h1>

      <div className="flex gap-2 mb-6">
        {statusTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">로딩 중...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-400 py-8">신청 내역이 없습니다</p>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{req.clubName}</h3>
                  <p className="text-sm text-gray-500">{req.universityName} · {req.slug}.aidongdong.co.kr</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  req.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {req.status === 'PENDING' ? '대기' : req.status === 'APPROVED' ? '승인' : '거절'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-400">신청자:</span>{' '}
                  <span className="font-medium">{req.applicantName}</span>
                </div>
                <div>
                  <span className="text-gray-400">이메일:</span>{' '}
                  <span className="font-medium">{req.applicantEmail}</span>
                </div>
                {req.applicantPhone && (
                  <div>
                    <span className="text-gray-400">연락처:</span>{' '}
                    <span className="font-medium">{req.applicantPhone}</span>
                  </div>
                )}
                {req.expectedMembers && (
                  <div>
                    <span className="text-gray-400">예상 회원:</span>{' '}
                    <span className="font-medium">{req.expectedMembers}명</span>
                  </div>
                )}
              </div>

              {req.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  {req.description}
                </p>
              )}

              {req.rejectReason && (
                <p className="text-sm text-red-500 mb-3">거절 사유: {req.rejectReason}</p>
              )}

              <div className="text-xs text-gray-400 mb-3">
                {new Date(req.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </div>

              {req.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => approveMutation.mutate(req.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    승인 (테넌트 자동 생성)
                  </button>
                  <button
                    onClick={() => setRejectId(req.id)}
                    className="flex-1 py-2 rounded-lg bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    거절
                  </button>
                </div>
              )}

              {rejectId === req.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="거절 사유를 입력해주세요"
                    className="input-field min-h-[60px]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => rejectMutation.mutate({ id: req.id, reason: rejectReason })}
                      disabled={rejectMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                    >
                      거절 확인
                    </button>
                    <button
                      onClick={() => { setRejectId(null); setRejectReason(''); }}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
