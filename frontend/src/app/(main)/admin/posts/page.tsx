'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Pin, PinOff } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { Post, PaginatedResponse } from '@/types';

export default function AdminPostsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: () => api<PaginatedResponse<Post>>('/posts', { params: { limit: 50 } }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminPosts'] }),
  });

  const pinMutation = useMutation({
    mutationFn: (id: string) => api(`/posts/${id}/pin`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminPosts'] }),
  });

  const posts = data?.data || [];

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">게시글 관리</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">({posts.length}개)</span>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !posts.length ? (
        <EmptyState title="게시글이 없습니다" />
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.isPinned && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded">고정</span>
                    )}
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">{post.category}</span>
                  </div>
                  <p className="font-medium truncate">{post.title}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {post.author?.name} · {formatDate(post.createdAt)} · 조회 {post.viewCount} · 좋아요 {post.likeCount}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => pinMutation.mutate(post.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    title={post.isPinned ? '고정 해제' : '고정'}
                  >
                    {post.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('이 게시글을 삭제하시겠습니까?')) {
                        deleteMutation.mutate(post.id);
                      }
                    }}
                    className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
