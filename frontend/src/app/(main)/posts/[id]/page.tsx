'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { ArrowLeft, Heart, MoreVertical, Send, Pencil, Trash2, Flag, FileText, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelativeTime, getCategoryLabel } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ReportModal from '@/components/ReportModal';
import type { Post, Comment } from '@/types';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api<Post>(`/posts/${id}`),
    retry: false,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: () => api(`/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      router.push('/feed');
    },
  });

  const handleDelete = () => {
    if (confirm('게시글을 삭제하시겠습니까?')) {
      deleteMutation.mutate();
    }
  };

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
  if (isError || !post) return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-6xl mb-4">🗑️</div>
      <h2 className="text-lg font-bold mb-2">삭제된 게시글입니다</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">이 게시글은 작성자에 의해 삭제되었거나 존재하지 않습니다.</p>
      <button
        onClick={() => router.push('/feed')}
        className="btn-primary"
      >
        피드로 돌아가기
      </button>
    </div>
  );

  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
              {user?.id === post.authorId && (
                <>
                  <button
                    onClick={() => { setShowMenu(false); router.push(`/posts/${id}/edit`); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Pencil size={14} /> 수정
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); handleDelete(); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Trash2 size={14} /> 삭제
                  </button>
                </>
              )}
              {user?.id !== post.authorId && (
                <button
                  onClick={() => { setShowMenu(false); setShowReport(true); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Flag size={14} /> 신고
                </button>
              )}
            </div>
          )}
        </div>
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

      {/* Attachments */}
      {post.attachments?.length > 0 && (
        <div className="space-y-2 mb-4">
          {post.attachments.map((url, i) => {
            const filename = url.split('/').pop() || 'file';
            const ext = filename.substring(filename.lastIndexOf('.'));
            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FileText size={20} className="text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                  첨부파일{i + 1}{ext}
                </span>
                <Download size={16} className="text-gray-400 shrink-0" />
              </a>
            );
          })}
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
          <CommentItem key={c.id} comment={c} onReply={(id) => setReplyTo(id)} onReport={(id) => setReportCommentId(id)} currentUserId={user?.id} />
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

      {showReport && (
        <ReportModal type="POST" targetId={id} onClose={() => setShowReport(false)} />
      )}
      {reportCommentId && (
        <ReportModal type="COMMENT" targetId={reportCommentId} onClose={() => setReportCommentId(null)} />
      )}
    </div>
  );
}

function CommentItem({ comment, onReply, onReport, currentUserId, depth = 0 }: { comment: Comment; onReply: (id: string) => void; onReport: (id: string) => void; currentUserId?: string; depth?: number }) {
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
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              답글
            </button>
            {currentUserId !== comment.authorId && (
              <button
                onClick={() => onReport(comment.id)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                title="신고"
              >
                <Flag size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} onReply={onReply} onReport={onReport} currentUserId={currentUserId} depth={depth + 1} />
      ))}
    </div>
  );
}
