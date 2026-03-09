'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function TenantRequestPage() {
  const [form, setForm] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    universityName: '',
    clubName: '',
    slug: '',
    description: '',
    expectedMembers: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSlugChange = (value: string) => {
    setForm(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/tenant-requests', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          expectedMembers: form.expectedMembers ? parseInt(form.expectedMembers) : undefined,
          applicantPhone: form.applicantPhone || undefined,
          description: form.description || undefined,
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '신청에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">신청이 완료되었습니다</h1>
          <p className="text-gray-500 dark:text-gray-400">
            관리자가 확인 후 승인 결과를 알려드리겠습니다.
            <br />
            승인 시 <strong>{form.slug}.aidongdong.co.kr</strong>에서
            <br />
            동문회를 이용할 수 있습니다.
          </p>
          <Link href="/" className="btn-primary inline-block px-8 py-3">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
          <ArrowLeft size={16} /> 홈으로
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
            <Building2 size={24} className="text-white dark:text-gray-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold">동문회 개설 신청</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">동동에서 동문회를 시작하세요</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 신청자 정보 */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">신청자 정보</h2>
            <div>
              <label className="block text-sm font-medium mb-1">이름 *</label>
              <input
                type="text"
                value={form.applicantName}
                onChange={e => setForm(prev => ({ ...prev, applicantName: e.target.value }))}
                className="input-field"
                required
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">이메일 *</label>
              <input
                type="email"
                value={form.applicantEmail}
                onChange={e => setForm(prev => ({ ...prev, applicantEmail: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">연락처</label>
              <input
                type="tel"
                value={form.applicantPhone}
                onChange={e => setForm(prev => ({ ...prev, applicantPhone: e.target.value }))}
                className="input-field"
                placeholder="010-0000-0000"
                maxLength={20}
              />
            </div>
          </div>

          {/* 동문회 정보 */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">동문회 정보</h2>
            <div>
              <label className="block text-sm font-medium mb-1">대학교 이름 *</label>
              <input
                type="text"
                value={form.universityName}
                onChange={e => setForm(prev => ({ ...prev, universityName: e.target.value }))}
                className="input-field"
                required
                maxLength={100}
                placeholder="한양대학교"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">동문회 이름 *</label>
              <input
                type="text"
                value={form.clubName}
                onChange={e => setForm(prev => ({ ...prev, clubName: e.target.value }))}
                className="input-field"
                required
                maxLength={100}
                placeholder="한양대 전기공학과 동문회"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">서브도메인 (슬러그) *</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  className="input-field flex-1"
                  required
                  maxLength={30}
                  placeholder="hanyang-ee"
                />
                <span className="text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">.aidongdong.co.kr</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">영소문자, 숫자, 하이픈만 사용 가능</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">소개</label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="input-field min-h-[80px]"
                maxLength={500}
                placeholder="동문회 소개를 간단히 작성해주세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">예상 회원 수</label>
              <input
                type="number"
                value={form.expectedMembers}
                onChange={e => setForm(prev => ({ ...prev, expectedMembers: e.target.value }))}
                className="input-field"
                min={1}
                max={10000}
                placeholder="50"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? '신청 중...' : '개설 신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
