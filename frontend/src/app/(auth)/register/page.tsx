'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { api } from '@/lib/api';

const steps = ['기본 정보', '동문 정보', '약관 동의'];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', passwordConfirm: '',
    name: '', phone: '',
    university: '', department: '', admissionYear: '', graduationYear: '', studentId: '',
    bio: '', company: '', position: '', location: '',
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

  const validateStep = (currentStep: number): string | null => {
    if (currentStep === 0) {
      if (!form.email || !form.password || !form.name) return '이메일, 비밀번호, 이름은 필수입니다.';
      if (form.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
      if (!passwordRegex.test(form.password))
        return '비밀번호에 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 각 1개 이상 포함해주세요.';
      if (form.password !== form.passwordConfirm) return '비밀번호가 일치하지 않습니다.';
    }
    if (currentStep === 1) {
      if (!form.university) return '대학명은 필수입니다.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async () => {
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
          bio: form.bio || undefined,
          company: form.company || undefined,
          position: form.position || undefined,
          location: form.location || undefined,
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
            <div>
              <input placeholder="비밀번호" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="input-field" required />
              <p className="text-xs text-gray-400 mt-1.5 ml-1">8자 이상 / 대문자·소문자·숫자·특수문자(@$!%*?&) 각 1개 이상</p>
            </div>
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
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-gray-900"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <Link href="/terms" target="_blank" className="underline font-medium text-gray-900 dark:text-gray-100">
                    이용약관
                  </Link>
                  에 동의합니다 <span className="text-red-500">(필수)</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-gray-900"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <Link href="/privacy" target="_blank" className="underline font-medium text-gray-900 dark:text-gray-100">
                    개인정보 처리방침
                  </Link>
                  에 동의합니다 <span className="text-red-500">(필수)</span>
                </span>
              </label>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">추가 프로필 (선택)</p>
              <div className="space-y-3">
                <textarea placeholder="자기소개" value={form.bio} onChange={(e) => update('bio', e.target.value)} className="input-field min-h-[80px] resize-none" />
                <input placeholder="회사" value={form.company} onChange={(e) => update('company', e.target.value)} className="input-field" />
                <input placeholder="직위" value={form.position} onChange={(e) => update('position', e.target.value)} className="input-field" />
                <input placeholder="거주지" value={form.location} onChange={(e) => update('location', e.target.value)} className="input-field" />
              </div>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

      <div className="mt-6">
        {step < 2 ? (
          <button onClick={handleNext} className="btn-primary w-full">
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || !agreeTerms || !agreePrivacy}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : '가입 신청하기'}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        ※ 약관 동의 및 회장 승인 후 이용 가능합니다
      </p>
    </div>
  );
}
