'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '@/lib/api';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { User } from '@/types';

export default function WriteLetterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WriteLetterContent />
    </Suspense>
  );
}

function WriteLetterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toUserId = searchParams.get('to');

  const [receiverId, setReceiverId] = useState(toUserId || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');

  const { data: targetUser } = useQuery({
    queryKey: ['user', receiverId],
    queryFn: () => api<User>('/users/' + receiverId),
    enabled: !!receiverId,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['members-search', search],
    queryFn: () => api<{ data: User[] }>('/users', { params: { search, limit: 5 } }),
    enabled: search.length >= 1 && !receiverId,
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      api('/dm/' + receiverId, {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      }),
    onSuccess: () => {
      router.push('/dm');
    },
  });

  const handleSubmit = () => {
    if (!receiverId || !title.trim() || !content.trim()) return;
    sendMutation.mutate();
  };

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">편지 쓰기</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!receiverId || !title.trim() || !content.trim() || sendMutation.isPending}
          className="flex items-center gap-1.5 btn-primary !py-2 !px-4 text-sm disabled:opacity-40"
        >
          <Send size={16} />
          {sendMutation.isPending ? '보내는 중...' : '보내기'}
        </button>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
        {/* Recipient */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {receiverId && targetUser ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">받는 사람</span>
              <div className="flex items-center gap-2">
                <Avatar src={targetUser.profileImage} name={targetUser.name} size="xs" />
                <span className="text-sm font-medium">{targetUser.name}</span>
              </div>
              <button
                onClick={() => { setReceiverId(''); setSearch(''); }}
                className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
              >
                변경
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">받는 사람</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="이름으로 검색"
                  className="flex-1 text-sm bg-transparent outline-none"
                  autoFocus
                />
              </div>
              {searchResults && searchResults.data.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
                  {searchResults.data.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setReceiverId(u.id); setSearch(''); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                    >
                      <Avatar src={u.profileImage} name={u.name} size="xs" />
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.university}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full text-base font-semibold bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
            maxLength={100}
          />
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="편지 내용을 작성하세요..."
            className="w-full min-h-[300px] text-sm bg-transparent outline-none resize-none text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 leading-relaxed"
            maxLength={5000}
          />
        </div>
      </div>

      {sendMutation.isError && (
        <p className="text-sm text-red-500 mt-3">편지 전송에 실패했습니다. 다시 시도해주세요.</p>
      )}
    </div>
  );
}
