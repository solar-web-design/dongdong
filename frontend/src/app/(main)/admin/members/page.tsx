'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getRoleBadge } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { User, Role } from '@/types';

const ROLES: { value: Role; label: string }[] = [
  { value: 'PRESIDENT', label: '회장' },
  { value: 'VICE_PRESIDENT', label: '부회장' },
  { value: 'TREASURER', label: '총무' },
  { value: 'MEMBER', label: '일반회원' },
];

export default function AdminMembersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: me } = useAuthStore();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => api<{ data: User[] }>('/users'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      api(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allUsers'] }),
    onError: (err: Error) => alert(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setConfirmDelete(null);
    },
  });

  const activeUsers = data?.data.filter((u) => u.status === 'ACTIVE') || [];

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">회원 역할 관리</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">({activeUsers.length}명)</span>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !activeUsers.length ? (
        <EmptyState title="회원이 없습니다" />
      ) : (
        <div className="space-y-3">
          {activeUsers.map((user) => {
            const role = getRoleBadge(user.role);
            return (
              <div key={user.id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={user.profileImage} name={user.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{user.name}</span>
                      {role && <Badge className={role.color}>{role.label}</Badge>}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value as Role })}
                    className="input-field flex-1 text-sm py-2"
                    disabled={roleMutation.isPending || user.id === me?.id}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {confirmDelete === user.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(user.id)}
                        className="px-3 py-2 bg-red-500 text-white text-xs rounded-lg"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-xs rounded-lg"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
