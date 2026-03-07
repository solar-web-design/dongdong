'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Reply, Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatDateTime } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { DirectMessage } from '@/types';

export default function LetterDetailPage() {
  const { letterId } = useParams<{ letterId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const deleteMutation = useMutation({
    mutationFn: () => api('/dm/' + letterId, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm'] });
      router.push('/dm');
    },
  });

  const handleDelete = () => {
    if (confirm('이 편지를 삭제하시겠습니까?')) {
      deleteMutation.mutate();
    }
  };

  const { data: letter, isLoading, isError } = useQuery({
    queryKey: ['dm', 'letter', letterId],
    queryFn: async () => {
      const result = await api<DirectMessage>("/dm/" + letterId);
      queryClient.invalidateQueries({ queryKey: ['dm', 'received'] });
      return result;
    },
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError || !letter) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h2 className="text-lg font-bold mb-2">편지를 찾을 수 없습니다</h2>
        <button onClick={() => router.push('/dm')} className="btn-primary mt-4">
          편지함으로 돌아가기
        </button>
      </div>
    );
  }

  const isMe = letter.senderId === user?.id;
  const otherPerson = isMe ? letter.receiver : letter.sender;

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">편지</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
            {letter.title || '(제목 없음)'}
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={otherPerson?.profileImage} name={otherPerson?.name || ''} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isMe ? 'To. ' + otherPerson?.name : 'From. ' + otherPerson?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(letter.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 min-h-[200px]">
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {letter.content}
          </p>
        </div>
      </div>

      {!isMe && otherPerson && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => router.push('/dm/write?to=' + otherPerson.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium"
          >
            <Reply size={16} />
            답장하기
          </button>
        </div>
      )}
    </div>
  );
}
