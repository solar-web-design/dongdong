'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Plus, Heart, MessageCircle, Pin, Search, X, Megaphone, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { cn, formatRelativeTime, getCategoryLabel } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { Post, Announcement, PaginatedResponse } from '@/types';

const categories = [
  { value: '', label: '전체' },
  { value: 'FREE', label: '자유' },
  { value: 'NEWS', label: '소식' },
  { value: 'JOB', label: '취업' },
  { value: 'MARKETPLACE', label: '장터' },
];

export default function FeedPage() {
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const queryClient = useQueryClient();
  const { on } = useSocket();

  useEffect(() => {
    const offDeleted = on('post_deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    });
    const offCreated = on('post_created', () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    });
    return () => { offDeleted(); offCreated(); };
  }, [on, queryClient]);

  const { data: announcements } = useQuery({
    queryKey: ['announcements', 'feed'],
    queryFn: () => api<PaginatedResponse<Announcement>>('/announcements', { params: { limit: 3 } }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['posts', category, page, search],
    queryFn: () =>
      api<PaginatedResponse<Post>>('/posts', {
        params: { page, limit: 20, category: category || undefined, search: search || undefined },
      }),
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="px-4">
      {/* Search */}
      <div className="relative mt-4">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="게시글 검색..."
          className="input-field w-full pl-10 pr-10"
        />
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {searchInput && (
          <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Announcements */}
      {announcements?.data && announcements.data.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <Megaphone size={16} />
              공지사항
            </div>
            <Link href="/announcements" className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600">
              더보기 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-1.5">
            {announcements.data.map((ann) => (
              <Link
                key={ann.id}
                href="/announcements"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/60 transition-colors"
              >
                {ann.isPinned && <Pin size={12} className="text-yellow-500 shrink-0" />}
                <span className="text-sm font-medium truncate flex-1">{ann.title}</span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">{formatRelativeTime(ann.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => { setCategory(cat.value); setPage(1); }}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              category === cat.value
                ? 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white backdrop-blur-md'
                : 'bg-gray-100/60 text-gray-500 hover:bg-gray-200/60 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:bg-gray-700/60'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <EmptyState title="게시글이 없습니다" description="첫 번째 글을 작성해보세요!" />
      ) : (
        <div className="space-y-3">
          {data.data.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="card block p-4 hover:shadow-md transition-shadow">
              {post.isPinned && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium mb-2">
                  <Pin size={12} />
                  고정됨
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={post.author.profileImage} name={post.author.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{post.author.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{formatRelativeTime(post.createdAt)}</span>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 dark:text-gray-500 px-2 py-0.5 rounded-full">
                  {getCategoryLabel(post.category)}
                </span>
              </div>
              <h3 className="font-semibold mb-1 truncate">{post.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{post.content}</p>
              {post.images.length > 0 && (
                <div className="relative mb-3 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 h-48">
                  <Image src={post.images[0]} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" />
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart size={16} /> {post.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={16} /> {post.comments?.length || 0}
                </span>
              </div>
            </Link>
          ))}

          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 py-4">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    'w-8 h-8 rounded-full text-sm font-medium',
                    page === i + 1 ? 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white backdrop-blur-md' : 'text-gray-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/posts/write"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white backdrop-blur-xl border border-gray-200/40 dark:border-gray-700/40 rounded-full flex items-center justify-center shadow-lg hover:bg-white/90 dark:hover:bg-gray-900/90 transition-colors z-40"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
