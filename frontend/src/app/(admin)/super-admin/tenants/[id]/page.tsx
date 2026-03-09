'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, UserCheck, UserX, Crown } from 'lucide-react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Tenant, Role, MemberStatus } from '@/types';

interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: MemberStatus;
  department?: string;
  admissionYear?: string;
  createdAt: string;
}

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

  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['tenant-users', id],
    queryFn: () => api<{ data: TenantUser[] }>(`/tenants/${id}/users`),
  });

  const pendingUsers = usersData?.data.filter((u) => u.status === 'PENDING') || [];
  const activeUsers = usersData?.data.filter((u) => u.status === 'ACTIVE') || [];
  const hasPresident = activeUsers.some((u) => u.role === 'PRESIDENT');

  const approveMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api(`/tenants/${id}/users/${userId}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      refetchUsers();
      queryClient.invalidateQueries({ queryKey: ['tenant-stats', id] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) =>
      api(`/tenants/${id}/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      refetchUsers();
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api(`/tenants/${id}/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      refetchUsers();
      queryClient.invalidateQueries({ queryKey: ['tenant-stats', id] });
    },
  });

  const roleLabel: Record<string, string> = {
    PRESIDENT: '회장',
    VICE_PRESIDENT: '부회장',
    TREASURER: '총무',
    MEMBER: '일반회원',
  };

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

      {/* 가입 대기 회원 */}
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <UserCheck size={20} className="text-amber-500" />
          가입 대기 회원 ({pendingUsers.length})
        </h2>

        {!hasPresident && pendingUsers.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
            <Crown size={14} className="inline mr-1" />
            회장이 없습니다. 첫 번째 회원을 <strong>회장</strong>으로 승인하세요.
          </div>
        )}

        {pendingUsers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">대기 중인 회원이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  {user.department && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {user.department} {user.admissionYear && `${user.admissionYear}학번`}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    id={`role-${user.id}`}
                    defaultValue={hasPresident ? 'MEMBER' : 'PRESIDENT'}
                    className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800"
                  >
                    {!hasPresident && <option value="PRESIDENT">회장</option>}
                    <option value="VICE_PRESIDENT">부회장</option>
                    <option value="TREASURER">총무</option>
                    <option value="MEMBER">일반회원</option>
                  </select>
                  <button
                    onClick={() => {
                      const select = document.getElementById(`role-${user.id}`) as HTMLSelectElement;
                      approveMutation.mutate({ userId: user.id, role: select.value });
                    }}
                    disabled={approveMutation.isPending}
                    className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                    title="승인"
                  >
                    <UserCheck size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`${user.name} 님의 가입을 거절하시겠습니까?`)) {
                        rejectMutation.mutate(user.id);
                      }
                    }}
                    disabled={rejectMutation.isPending}
                    className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    title="거절"
                  >
                    <UserX size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 활성 회원 목록 */}
      {activeUsers.length > 0 && (
        <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold mb-4">활성 회원 ({activeUsers.length})</h2>
          <div className="space-y-2">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div>
                  <div className="font-medium text-sm flex items-center gap-1.5">
                    {user.name}
                    {user.role === 'PRESIDENT' && <Crown size={13} className="text-amber-500" />}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    id={`active-role-${user.id}`}
                    defaultValue={user.role}
                    className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800"
                  >
                    <option value="PRESIDENT">회장</option>
                    <option value="VICE_PRESIDENT">부회장</option>
                    <option value="TREASURER">총무</option>
                    <option value="MEMBER">일반회원</option>
                  </select>
                  <button
                    onClick={() => {
                      const select = document.getElementById(`active-role-${user.id}`) as HTMLSelectElement;
                      if (select.value === user.role) return;
                      if (select.value === 'PRESIDENT' && !confirm(`${user.name} 님을 회장으로 변경하시겠습니까? 기존 회장은 일반회원으로 변경됩니다.`)) return;
                      changeRoleMutation.mutate({ userId: user.id, role: select.value });
                    }}
                    disabled={changeRoleMutation.isPending}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    변경
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
