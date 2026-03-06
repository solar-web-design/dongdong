'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { ArrowLeft, Heart, MoreVertical, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime, getCategoryLabel } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Post, Comment } from '@/types';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api<Post>(`/posts/${id}`),
  });

  const likeMutation = useMutation({
    mutationFn: () => api(`/posts/${id}/like`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['post', id] }),
  });

  const commentMutation = useMutation({
    mutationFn: (body: { content: string; parentId?: string }) =>
      api(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      setComment('');
      setReplyTo(null);
    },
  });

  const handleComment = () => {
    if (!comment.trim()) return;
    commentMutation.mutate({
      content: comment,
      parentId: replyTo || undefined,
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (!post) return null;

  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <ArrowLeft size={20} />
        </button>
        {user?.id === post.authorId && (
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <MoreVertical size={20} />
          </button>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={post.author.profileImage} name={post.author.name} size="md" />
        <div>
          <div className="font-medium">{post.author.name}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {post.author.department && `${post.author.department} `}
            {post.author.admissionYear && `'${String(post.author.admissionYear).slice(2)}`}
            <span className="mx-1">·</span>
            {formatRelativeTime(post.createdAt)}
          </div>
        </div>
        <span className="ml-auto text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 dark:text-gray-500 px-2 py-0.5 rounded-full">
          {getCategoryLabel(post.category)}
        </span>
      </div>

      {/* Content */}
      <h1 className="text-xl font-bold mb-3">{post.title}</h1>
      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{post.content}</div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="space-y-2 mb-4">
          {post.images.map((img, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video">
              <Image src={img} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" />
            </div>
          ))}
        </div>
      )}

      {/* Like */}
      <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => likeMutation.mutate()}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
        >
          <Heart size={18} />
          좋아요 {post.likeCount}
        </button>
      </div>

      {/* Comments */}
      <div className="py-4">
        {post.comments?.map((c) => (
          <CommentItem key={c.id} comment={c} onReply={(id) => setReplyTo(id)} />
        ))}
      </div>

      {/* Comment Input */}
      <div className="sticky bottom-16 md:bottom-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-4 py-3 -mx-4">
        {replyTo && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">
            답글 작성 중
            <button onClick={() => setReplyTo(null)} className="ml-2 text-gray-900 dark:text-gray-100 font-medium">취소</button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            placeholder="댓글을 입력하세요"
            className="input-field flex-1"
          />
          <button
            onClick={handleComment}
            disabled={!comment.trim() || commentMutation.isPending}
            className="btn-primary !px-4"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, onReply, depth = 0 }: { comment: Comment; onReply: (id: string) => void; depth?: number }) {
  return (
    <div className={depth > 0 ? 'ml-8 mt-3' : 'mb-4'}>
      <div className="flex gap-2">
        <Avatar src={comment.author.profileImage} name={comment.author.name} size="sm" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.author.name}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{comment.content}</p>
          <button
            onClick={() => onReply(comment.id)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1"
          >
            답글
          </button>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} onReply={onReply} depth={depth + 1} />
      ))}
    </div>
  );
}
