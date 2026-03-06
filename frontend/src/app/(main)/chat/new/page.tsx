'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { PaginatedResponse, User } from '@/types';
import Avatar from '@/components/Avatar';

export default function NewChatPage() {
  const router = useRouter();
  const { user: me } = useAuthStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');

  const { data } = useQuery({
    queryKey: ['members', search],
    queryFn: () => api<PaginatedResponse<User>>('/users', { params: { search, limit: 50 } }),
  });

  const members = data?.data?.filter((u) => u.id !== me?.id) || [];

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (selected.length === 0) return;

    const body: { memberIds: string[]; name?: string; type: string } = {
      memberIds: selected,
      type: selected.length === 1 ? 'DM' : 'GROUP',
    };
    if (selected.length > 1 && name) body.name = name;

    const room = await api<{ id: string }>('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    router.push(`/chat/${room.id}`);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">새 채팅</h1>
        <button
          onClick={handleCreate}
          disabled={selected.length === 0}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          만들기 ({selected.length})
        </button>
      </div>

      {selected.length > 1 && (
        <input
          type="text"
          placeholder="그룹 채팅방 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field mb-4"
        />
      )}

      <input
        type="text"
        placeholder="이름으로 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field mb-4"
      />

      <div className="space-y-2">
        {members.map((user) => (
          <button
            key={user.id}
            onClick={() => toggleSelect(user.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              selected.includes(user.id) ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Avatar name={user.name} src={user.profileImage} size="md" />
            <div className="text-left">
              <p className="font-medium">{user.name}</p>
              <p className={`text-sm ${selected.includes(user.id) ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                {user.department} {user.admissionYear ? `'${String(user.admissionYear).slice(2)}` : ''}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
