'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Paperclip, X, FileText } from 'lucide-react';
import { api, apiUpload, resizeImage } from '@/lib/api';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Post, PostCategory } from '@/types';

const categories: { value: PostCategory; label: string }[] = [
  { value: 'FREE', label: '자유' },
  { value: 'NEWS', label: '소식' },
  { value: 'JOB', label: '취업' },
  { value: 'MARKETPLACE', label: '장터' },
];

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('FREE');
  const [images, setImages] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api<Post>(`/posts/${id}`),
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setImages(post.images);
      setAttachments(post.attachments || []);
    }
  }, [post]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      await Promise.all(Array.from(files).map(async (f) => {
        const resized = await resizeImage(f);
        const formData = new FormData();
        formData.append('file', resized);
        const { url } = await apiUpload<{ url: string }>('/upload/image', formData);
        urls.push(url);
      }));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { url } = await apiUpload<{ url: string }>('/upload/file', formData);
      setAttachments((prev) => [...prev, url]);
    } catch {
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await api<Post>(`/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, content, category, images, attachments }),
      });
      router.push(`/posts/${id}`);
    } catch (err) {
      alert('게시글 수정 실패: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!post) return null;

  return (
    <div className="px-4">
      <div className="flex items-center justify-between py-4">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <button onClick={handleSubmit} disabled={loading || !title.trim()} className="btn-primary !py-2 !px-5 text-sm">
          {loading ? '수정 중...' : '수정'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              category === cat.value ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <input
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-xl font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600 border-none outline-none mb-4 bg-transparent"
      />

      <textarea
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[300px] text-gray-700 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-600 border-none outline-none resize-none bg-transparent"
      />

      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {images.map((img, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2 mb-4">
          {attachments.map((url, i) => {
            const filename = url.split('/').pop() || 'file';
            const ext = filename.substring(filename.lastIndexOf('.'));
            return (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <FileText size={16} className="text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">첨부파일{i + 1}{ext}</span>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 py-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          업로드 중...
        </div>
      )}

      <div className="border-t border-gray-100 dark:border-gray-800 py-3 flex gap-4">
        <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
          <ImagePlus size={20} />
          <span className="text-sm">이미지</span>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        </label>
        <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
          <Paperclip size={20} />
          <span className="text-sm">파일 첨부</span>
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.hwpx,.txt,.zip" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}
