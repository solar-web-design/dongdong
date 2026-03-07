'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Tenant } from '@/types';

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    universityName: '',
    slug: '',
    description: '',
    primaryColor: '#000000',
    maxMembers: 500,
    status: 'ACTIVE' as string,
  });

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => api<Tenant>(`/tenants/${id}`),
  });

  const { data: stats } = useQuery({
    queryKey: ['tenant-stats', id],
    queryFn: () => api<{ userCount: number; postCount: number; meetingCount: number }>(`/tenants/${id}/stats`),
  });

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name,
        universityName: tenant.universityName,
        slug: tenant.slug,
        description: tenant.description || '',
        primaryColor: tenant.primaryColor,
        maxMembers: tenant.maxMembers,
        status: tenant.status,
      });
    }
  }, [tenant]);

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: () => api(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(form) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      alert('저장되었습니다');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api(`/tenants/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      router.push('/super-admin');
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!tenant) return null;

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">{tenant.name} 관리</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-bold">{stats.userCount}</p>
            <p className="text-xs text-gray-500">회원</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-bold">{stats.postCount}</p>
            <p className="text-xs text-gray-500">게시글</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-bold">{stats.meetingCount}</p>
            <p className="text-xs text-gray-500">모임</p>
          </div>
        </div>
      )}

      <div className="space-y-4 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">슬러그</label>
          <input value={form.slug} onChange={(e) => update('slug', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">동문회 이름</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">대학교 이름</label>
          <input value={form.universityName} onChange={(e) => update('universityName', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">소개</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="input-field min-h-[80px] resize-none" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">대표 색상</label>
            <input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">최대 회원수</label>
            <input type="number" value={form.maxMembers} onChange={(e) => update('maxMembers', parseInt(e.target.value) || 500)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">상태</label>
            <select value={form.status} onChange={(e) => update('status', e.target.value)} className="input-field">
              <option value="ACTIVE">활성</option>
              <option value="TRIAL">체험</option>
              <option value="SUSPENDED">정지</option>
            </select>
          </div>
        </div>

        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-primary w-full">
          {saveMutation.isPending ? '저장 중...' : '저장'}
        </button>

        <button
          onClick={() => {
            if (confirm('정말 삭제하시겠습니까? 회원이 있는 테넌트는 삭제할 수 없습니다.')) {
              deleteMutation.mutate();
            }
          }}
          className="btn-secondary w-full text-red-500 !border-red-200 hover:!bg-red-50 dark:!border-red-800 dark:hover:!bg-red-900/30 flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          동문회 삭제
        </button>
      </div>
    </div>
  );
}
