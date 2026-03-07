'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

const REASONS = [
  { value: 'SPAM', label: '스팸/광고' },
  { value: 'ABUSE', label: '욕설/비방' },
  { value: 'HARASSMENT', label: '괴롭힘/성희롱' },
  { value: 'FALSE_INFO', label: '허위 정보' },
  { value: 'INAPPROPRIATE', label: '부적절한 콘텐츠' },
  { value: 'OTHER', label: '기타' },
];

interface ReportModalProps {
  type: 'POST' | 'COMMENT';
  targetId: string;
  onClose: () => void;
}

export default function ReportModal({ type, targetId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      api('/reports', {
        method: 'POST',
        body: JSON.stringify({
          type,
          reason,
          description: description || undefined,
          ...(type === 'POST' ? { postId: targetId } : { commentId: targetId }),
        }),
      }),
    onSuccess: () => setSuccess(true),
  });

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
          <p className="text-lg font-semibold mb-2">신고가 접수되었습니다</p>
          <p className="text-sm text-gray-500 mb-4">관리자가 검토 후 조치하겠습니다.</p>
          <button onClick={onClose} className="btn-primary w-full">확인</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">신고하기</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-2 mb-4">
          {REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={(e) => setReason(e.target.value)}
                className="w-4 h-4 accent-gray-900"
              />
              <span className="text-sm">{r.label}</span>
            </label>
          ))}
        </div>

        {reason === 'OTHER' && (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상세 사유를 입력해주세요"
            className="input-field min-h-[80px] resize-none mb-4"
            maxLength={500}
          />
        )}

        {mutation.isError && (
          <p className="text-sm text-red-500 mb-3">
            {(mutation.error as Error)?.message || '신고에 실패했습니다'}
          </p>
        )}

        <button
          onClick={() => mutation.mutate()}
          disabled={!reason || mutation.isPending}
          className="btn-primary w-full disabled:opacity-40"
        >
          {mutation.isPending ? '처리 중...' : '신고하기'}
        </button>
      </div>
    </div>
  );
}
