'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import type { Meeting } from '@/types';

export default function CreateMeetingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    maxMembers: '',
    fee: '',
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time) return;
    setLoading(true);

    try {
      const dateTime = new Date(`${form.date}T${form.time}`).toISOString();
      const meeting = await api<Meeting>('/meetings', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          location: form.location || undefined,
          date: dateTime,
          maxMembers: form.maxMembers ? Number(form.maxMembers) : undefined,
          fee: form.fee ? Number(form.fee) : 0,
        }),
      });
      router.push(`/meetings/${meeting.id}`);
    } catch {
      alert('모임 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">모임 만들기</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">모임 이름 *</label>
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="예: 3월 정기 모임"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">상세 설명</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="모임에 대해 자세히 설명해주세요"
            className="input-field min-h-[120px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">날짜 *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">시간 *</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => update('time', e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">장소</label>
          <input
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="예: 강남역 근처 식당"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">최대 인원</label>
            <input
              type="number"
              min="2"
              value={form.maxMembers}
              onChange={(e) => update('maxMembers', e.target.value)}
              placeholder="제한 없음"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">참가비 (원)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={form.fee}
              onChange={(e) => update('fee', e.target.value)}
              placeholder="0"
              className="input-field"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
          {loading ? '생성 중...' : '모임 만들기'}
        </button>
      </form>
    </div>
  );
}
