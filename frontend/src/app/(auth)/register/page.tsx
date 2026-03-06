'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { api } from '@/lib/api';

const steps = ['기본 정보', '동문 정보', '프로필'];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', passwordConfirm: '',
    name: '', phone: '',
    university: '', department: '', admissionYear: '', graduationYear: '', studentId: '',
    bio: '', company: '', position: '', location: '',
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone || undefined,
          university: form.university,
          department: form.department || undefined,
          admissionYear: form.admissionYear ? Number(form.admissionYear) : undefined,
          graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
          studentId: form.studentId || undefined,
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '가입 신청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="text-green-600" size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">가입 신청 완료</h2>
        <p className="text-gray-500 mb-6">회장 승인 후 이용 가능합니다.</p>
        <Link href="/login" className="btn-primary inline-block">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <button onClick={() => (step > 0 ? setStep(step - 1) : router.back())} className="mb-4 text-gray-500 hover:text-gray-900">
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-2xl font-bold mb-2">가입 신청</h1>

      {/* Step Indicator */}
      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1 rounded-full ${i <= step ? 'bg-gray-900' : 'bg-gray-200'}`} />
            <span className={`text-xs mt-1 block ${i <= step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {step === 0 && (
          <>
            <input placeholder="이메일" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" required />
            <input placeholder="비밀번호" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="input-field" required />
            <input placeholder="비밀번호 확인" type="password" value={form.passwordConfirm} onChange={(e) => update('passwordConfirm', e.target.value)} className="input-field" required />
            <input placeholder="이름" value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field" required />
            <input placeholder="전화번호 (선택)" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" />
          </>
        )}
        {step === 1 && (
          <>
            <input placeholder="대학명" value={form.university} onChange={(e) => update('university', e.target.value)} className="input-field" required />
            <input placeholder="학과" value={form.department} onChange={(e) => update('department', e.target.value)} className="input-field" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="입학년도" type="number" value={form.admissionYear} onChange={(e) => update('admissionYear', e.target.value)} className="input-field" />
              <input placeholder="졸업년도" type="number" value={form.graduationYear} onChange={(e) => update('graduationYear', e.target.value)} className="input-field" />
            </div>
            <input placeholder="학번" value={form.studentId} onChange={(e) => update('studentId', e.target.value)} className="input-field" />
          </>
        )}
        {step === 2 && (
          <>
            <textarea placeholder="자기소개 (선택)" value={form.bio} onChange={(e) => update('bio', e.target.value)} className="input-field min-h-[100px] resize-none" />
            <input placeholder="회사 (선택)" value={form.company} onChange={(e) => update('company', e.target.value)} className="input-field" />
            <input placeholder="직위 (선택)" value={form.position} onChange={(e) => update('position', e.target.value)} className="input-field" />
            <input placeholder="거주지 (선택)" value={form.location} onChange={(e) => update('location', e.target.value)} className="input-field" />
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

      <div className="mt-6">
        {step < 2 ? (
          <button onClick={() => setStep(step + 1)} className="btn-primary w-full">
            다음
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? '처리 중...' : '가입 신청하기'}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        ※ 회장 승인 후 이용 가능합니다
      </p>
    </div>
  );
}
