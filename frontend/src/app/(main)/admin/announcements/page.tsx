'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Edit2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { Announcement } from '@/types';

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', isPinned: false });

  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api<{ data: Announcement[] }>('/announcements'),
  });

  const createMutation = useMutation({
    mutationFn: () => api('/announcements', { method: 'POST', body: JSON.stringify(form) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => api(`/announcements/${editId}`, { method: 'PATCH', body: JSON.stringify(form) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/announcements/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ title: '', content: '', isPinned: false });
  };

  const startEdit = (a: Announcement) => {
    setEditId(a.id);
    setForm({ title: a.title, content: a.content, isPinned: a.isPinned });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const announcements = data?.data || [];

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold flex-1">공지사항 관리</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1 text-sm px-3 py-2">
            <Plus size={16} /> 작성
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editId ? '공지 수정' : '새 공지'}</h2>
            <button onClick={resetForm}><X size={18} /></button>
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="제목"
            className="input-field"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="내용"
            className="input-field min-h-[120px] resize-none"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))}
            />
            상단 고정
          </label>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim() || !form.content.trim() || createMutation.isPending || updateMutation.isPending}
            className="btn-primary w-full"
          >
            {createMutation.isPending || updateMutation.isPending ? '저장 중...' : editId ? '수정' : '작성'}
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : !announcements.length ? (
        <EmptyState title="공지사항이 없습니다" />
      ) : (
        <div className="space-y-2">
          {announcements.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {a.isPinned && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded">고정</span>
                    )}
                    <span className="font-medium">{a.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{a.content}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {a.author?.name} · {formatDate(a.createdAt)}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(a)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => { if (confirm('삭제하시겠습니까?')) deleteMutation.mutate(a.id); }}
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
