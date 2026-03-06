'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Camera, Sun, Moon, Monitor } from 'lucide-react';
import { api, apiUpload } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useThemeStore } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import type { User } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    company: user?.company || '',
    position: user?.position || '',
    location: user?.location || '',
    website: user?.website || '',
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: () =>
      api<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(form),
      }),
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { url } = await apiUpload<{ url: string }>('/upload/image', formData);
      const updated = await api<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ profileImage: url }),
      });
      setUser(updated);
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    logout();
    router.push('/');
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">설정</h1>
      </div>

      {/* Profile Image */}
      <div className="flex justify-center mb-6">
        <label className="relative cursor-pointer">
          <Avatar src={user?.profileImage} name={user?.name || '?'} size="xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full flex items-center justify-center">
            <Camera size={14} />
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">이름</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">전화번호</label>
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">자기소개</label>
          <textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} className="input-field min-h-[80px] resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">회사</label>
            <input value={form.company} onChange={(e) => update('company', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">직위</label>
            <input value={form.position} onChange={(e) => update('position', e.target.value)} className="input-field" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">거주지</label>
          <input value={form.location} onChange={(e) => update('location', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">웹사이트</label>
          <input value={form.website} onChange={(e) => update('website', e.target.value)} className="input-field" />
        </div>

        {/* Theme */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">테마</label>
          <div className="flex gap-2">
            {([
              { value: 'light' as const, icon: Sun, label: '라이트' },
              { value: 'dark' as const, icon: Moon, label: '다크' },
              { value: 'system' as const, icon: Monitor, label: '시스템' },
            ]).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    theme === t.value
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="btn-primary w-full"
        >
          {saveMutation.isPending ? '저장 중...' : '저장'}
        </button>

        <button onClick={handleLogout} className="btn-secondary w-full text-red-500 !border-red-200 hover:!bg-red-50 dark:!border-red-800 dark:hover:!bg-red-900/30">
          로그아웃
        </button>
      </div>
    </div>
  );
}
