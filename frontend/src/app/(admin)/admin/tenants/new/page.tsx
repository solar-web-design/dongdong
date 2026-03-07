'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    slug: '',
    name: '',
    universityName: '',
    description: '',
    primaryColor: '#000000',
    maxMembers: 500,
  });

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.slug || !form.name || !form.universityName) return;
    setLoading(true);
    try {
      await api('/tenants', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push('/super-admin');
    } catch (err) {
      alert('생성 실패: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">동문회 추가</h1>
      </div>

      <div className="space-y-4 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            슬러그 (서브도메인)
          </label>
          <div className="flex items-center gap-2">
            <input
              value={form.slug}
              onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="hanyang"
              className="input-field flex-1"
            />
            <span className="text-sm text-gray-400">.dongdong.kr</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">동문회 이름</label>
          <input
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="한양대 동문회"
            className="input-field"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">대학교 이름</label>
          <input
            value={form.universityName}
            onChange={(e) => update('universityName', e.target.value)}
            placeholder="한양대학교"
            className="input-field"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">소개</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="동문회 소개"
            className="input-field min-h-[80px] resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">대표 색상</label>
            <input
              type="color"
              value={form.primaryColor}
              onChange={(e) => update('primaryColor', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">최대 회원수</label>
            <input
              type="number"
              value={form.maxMembers}
              onChange={(e) => update('maxMembers', parseInt(e.target.value) || 500)}
              className="input-field"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !form.slug || !form.name || !form.universityName}
          className="btn-primary w-full"
        >
          {loading ? '생성 중...' : '동문회 생성'}
        </button>
      </div>
    </div>
  );
}
