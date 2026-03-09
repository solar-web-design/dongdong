'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UserPlus,
  CheckCircle,
  MessageCircle,
  Calendar,
  CreditCard,
  Bell,
  Shield,
  Users,
  Send,
  Heart,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  Megaphone,
  BookOpen,
} from 'lucide-react';

/* ── 가이드 스텝 데이터 ── */
const steps = [
  {
    id: 'join',
    icon: UserPlus,
    gradient: 'from-blue-500 to-blue-600',
    title: '1. 가입 신청',
    summary: '이메일 또는 소셜 로그인으로 간편하게',
    details: [
      { label: '소셜 로그인', desc: '카카오 또는 Google 계정으로 원클릭 가입이 가능합니다.' },
      { label: '이메일 가입', desc: '이메일 주소와 비밀번호를 입력하여 가입할 수 있습니다.' },
      { label: '프로필 작성', desc: '이름, 학과, 입학년도, 프로필 사진 등을 입력합니다.' },
      { label: '가입 신청 완료', desc: '가입 신청 후 동문회 회장의 승인을 기다립니다.' },
    ],
    tip: '소셜 로그인을 사용하면 비밀번호 관리 없이 편리하게 이용할 수 있어요.',
  },
  {
    id: 'approval',
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-emerald-600',
    title: '2. 가입 승인',
    summary: '회장이 승인하면 모든 기능 이용 가능',
    details: [
      { label: '승인 대기', desc: '가입 신청 후 동문회 회장에게 알림이 전달됩니다.' },
      { label: '회장 승인', desc: '회장이 관리자 페이지에서 가입을 승인하면 알림을 받습니다.' },
      { label: '바로 시작', desc: '승인 완료 후 피드, 채팅, 모임 등 모든 기능을 이용할 수 있습니다.' },
    ],
    tip: '승인이 늦어지면 동문회 임원에게 직접 연락해보세요.',
  },
  {
    id: 'feed',
    icon: Heart,
    gradient: 'from-rose-500 to-pink-600',
    title: '3. 피드 & 게시판',
    summary: '동문 소식을 공유하고 소통해요',
    details: [
      { label: '게시글 작성', desc: '자유, 소식, 취업, 장터 등 카테고리별로 글을 작성할 수 있습니다.' },
      { label: '좋아요 & 댓글', desc: '마음에 드는 글에 좋아요를 누르고, 댓글로 의견을 남기세요.' },
      { label: '이미지 업로드', desc: '게시글에 사진을 첨부하여 더 풍성한 소식을 전할 수 있습니다.' },
      { label: '검색 & 필터', desc: '키워드 검색과 카테고리 필터로 원하는 글을 빠르게 찾으세요.' },
    ],
    tip: '공지사항은 피드 상단에 고정되어 항상 확인할 수 있어요.',
  },
  {
    id: 'chat',
    icon: MessageCircle,
    gradient: 'from-blue-500 to-cyan-500',
    title: '4. 실시간 채팅',
    summary: '동문끼리 실시간으로 대화해요',
    details: [
      { label: '그룹 채팅방', desc: '학과별, 기수별, 관심사별 다양한 채팅방을 만들 수 있습니다.' },
      { label: '실시간 메시지', desc: '메시지를 보내면 즉시 상대방에게 전달됩니다.' },
      { label: '이미지 전송', desc: '채팅 중에도 사진을 보낼 수 있습니다.' },
      { label: '입력 중 표시', desc: '상대방이 메시지를 입력 중이면 표시가 나타납니다.' },
    ],
    tip: '1:1 대화가 필요하면 DM(쪽지) 기능을 활용하세요.',
  },
  {
    id: 'dm',
    icon: Send,
    gradient: 'from-sky-500 to-blue-600',
    title: '5. DM (쪽지)',
    summary: '1:1 프라이빗 메시지',
    details: [
      { label: '쪽지 보내기', desc: '회원 목록에서 원하는 동문을 선택하여 쪽지를 보낼 수 있습니다.' },
      { label: '편지함', desc: '받은 쪽지와 보낸 쪽지를 한눈에 확인할 수 있습니다.' },
      { label: '삭제', desc: '불필요한 쪽지는 개별적으로 삭제할 수 있습니다.' },
    ],
    tip: '개인적인 연락처 교환이나 업무 제안은 DM으로!',
  },
  {
    id: 'meeting',
    icon: Calendar,
    gradient: 'from-violet-500 to-purple-600',
    title: '6. 모임 관리',
    summary: 'RSVP로 간편하게 참석 관리',
    details: [
      { label: '모임 생성', desc: '날짜, 장소, 참석 인원 제한 등을 설정하여 모임을 만들 수 있습니다.' },
      { label: 'RSVP 참석 응답', desc: '참석/불참석/미정 중 선택하여 응답할 수 있습니다.' },
      { label: '참석자 현황', desc: '누가 참석하는지 실시간으로 확인할 수 있습니다.' },
      { label: '모임 수정/취소', desc: '모임 생성자나 관리자가 일정을 수정하거나 취소할 수 있습니다.' },
    ],
    tip: '정기모임은 공지사항과 함께 등록하면 참여율이 높아져요.',
  },
  {
    id: 'finance',
    icon: CreditCard,
    gradient: 'from-amber-500 to-orange-500',
    title: '7. 회비 & 회계',
    summary: '투명한 회비 관리',
    details: [
      { label: '회비 일정', desc: '연회비, 월회비 등 납부 일정을 설정하고 관리할 수 있습니다.' },
      { label: '납부 현황', desc: '회원별 납부 여부를 한눈에 확인할 수 있습니다.' },
      { label: '회계 장부', desc: '수입/지출 내역을 기록하여 투명하게 관리합니다.' },
      { label: '납부 확인', desc: '총무가 납부를 확인하면 회원에게 알림이 전달됩니다.' },
    ],
    tip: '총무(TREASURER) 권한이 있어야 회계 관리가 가능합니다.',
  },
  {
    id: 'notification',
    icon: Bell,
    gradient: 'from-pink-500 to-rose-600',
    title: '8. 알림',
    summary: '중요한 소식을 놓치지 마세요',
    details: [
      { label: '실시간 알림', desc: '댓글, 좋아요, 가입 승인 등 주요 활동에 대한 알림을 받습니다.' },
      { label: '알림 목록', desc: '알림 페이지에서 모든 알림을 확인할 수 있습니다.' },
      { label: '개별/전체 삭제', desc: '읽은 알림은 개별 또는 전체 삭제할 수 있습니다.' },
    ],
    tip: '알림 아이콘의 빨간 뱃지 숫자로 읽지 않은 알림 수를 확인하세요.',
  },
  {
    id: 'admin',
    icon: Shield,
    gradient: 'from-gray-600 to-gray-800',
    title: '9. 관리자 기능',
    summary: '동문회 운영을 위한 관리 도구',
    details: [
      { label: '가입 승인/거절', desc: '회장은 신규 가입 신청을 승인하거나 거절할 수 있습니다.' },
      { label: '회원 관리', desc: '회원 역할 변경(부회장, 총무 등)과 강제 탈퇴가 가능합니다.' },
      { label: '게시글 관리', desc: '게시글 고정, 삭제 등의 관리 기능을 사용할 수 있습니다.' },
      { label: '신고 처리', desc: '부적절한 게시글/댓글 신고를 검토하고 처리할 수 있습니다.' },
    ],
    tip: '역할별 권한: 회장(전체) > 부회장(모임/공지) > 총무(회비) > 일반회원',
  },
];

/* ── FAQ 데이터 ── */
const faqs = [
  {
    q: '가입 후 바로 사용할 수 있나요?',
    a: '아닙니다. 동문회 운영의 보안을 위해 회장(관리자)의 승인이 필요합니다. 가입 신청 후 승인을 기다려주세요.',
  },
  {
    q: '여러 동문회에 가입할 수 있나요?',
    a: '네, 동동은 멀티테넌트 구조로 대학별 서브도메인이 분리되어 있어, 각 동문회마다 별도로 가입할 수 있습니다.',
  },
  {
    q: '탈퇴는 어떻게 하나요?',
    a: '설정 페이지에서 계정 탈퇴를 진행할 수 있습니다. 탈퇴 시 작성한 게시글과 댓글은 유지됩니다.',
  },
  {
    q: '비밀번호를 잊어버렸어요.',
    a: '소셜 로그인(카카오/구글)을 사용했다면 해당 서비스에서 로그인하시면 됩니다. 이메일 가입의 경우 관리자에게 문의해주세요.',
  },
  {
    q: '모바일에서도 사용할 수 있나요?',
    a: '네, 동동은 모바일 최적화된 반응형 웹앱입니다. 브라우저에서 바로 이용하거나, 홈화면에 추가하여 앱처럼 사용할 수 있습니다.',
  },
];

export default function GuidePage() {
  const [openStep, setOpenStep] = useState<string | null>('join');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0c]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-gray-200/40 dark:border-gray-800/40"
        style={{
          background: 'rgba(250,250,248,0.8)',
          backdropFilter: 'blur(20px) saturate(1.5)',
        }}
      >
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/" className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-amber-500" />
            <h1 className="text-[16px] font-bold text-gray-900 dark:text-white">사용 가이드</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* 인트로 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-950 dark:bg-white mb-4">
            <span className="text-[22px] font-black text-white dark:text-gray-950">동</span>
          </div>
          <h2 className="text-[22px] font-bold text-gray-900 dark:text-white mb-2">
            동동 시작하기
          </h2>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
            가입부터 활용까지, 동동의 모든 기능을<br />
            단계별로 안내합니다.
          </p>
        </div>

        {/* 퀵 네비게이션 */}
        <div className="flex flex-wrap gap-1.5 mb-8 justify-center">
          {steps.map(({ id, icon: Icon, gradient, title }) => (
            <button
              key={id}
              onClick={() => {
                setOpenStep(id);
                document.getElementById(`step-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}
            >
              <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon size={9} className="text-white" />
              </div>
              {title.replace(/^\d+\.\s/, '')}
            </button>
          ))}
        </div>

        {/* 스텝 아코디언 */}
        <div className="space-y-3">
          {steps.map(({ id, icon: Icon, gradient, title, summary, details, tip }) => {
            const isOpen = openStep === id;
            return (
              <div
                key={id}
                id={`step-${id}`}
                className="rounded-2xl border border-gray-200/40 dark:border-gray-700/30 overflow-hidden transition-all duration-300"
                style={{
                  background: isOpen ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <button
                  onClick={() => setOpenStep(isOpen ? null : id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-gray-800 dark:text-gray-200">{title}</div>
                    <div className="text-[12px] text-gray-400 dark:text-gray-500">{summary}</div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 animate-fadeIn">
                    <div className="h-px bg-gray-200/50 dark:bg-gray-700/30" />
                    <div className="space-y-2.5 pl-[52px]">
                      {details.map(({ label, desc }) => (
                        <div key={label}>
                          <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">
                            {label}
                          </div>
                          <div className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                            {desc}
                          </div>
                        </div>
                      ))}
                    </div>
                    {tip && (
                      <div className="ml-[52px] flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/30 dark:border-amber-800/20">
                        <span className="text-[13px] shrink-0">💡</span>
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">{tip}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 권한 체계 */}
        <div className="mt-12 mb-10">
          <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-gray-400" />
            회원 권한 체계
          </h3>
          <div className="rounded-2xl border border-gray-200/40 dark:border-gray-700/30 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)' }}
          >
            {[
              { role: '회장 (PRESIDENT)', desc: '전체 관리, 가입 승인, 역할 변경, 강제 탈퇴', color: 'from-red-500 to-red-600' },
              { role: '부회장 (VICE_PRESIDENT)', desc: '모임 관리, 공지사항 작성', color: 'from-orange-500 to-amber-500' },
              { role: '총무 (TREASURER)', desc: '회비 일정 관리, 회계 장부 관리', color: 'from-blue-500 to-blue-600' },
              { role: '일반회원 (MEMBER)', desc: '게시판, 채팅, 모임 참석, DM 등 기본 기능', color: 'from-gray-400 to-gray-500' },
            ].map(({ role, desc, color }, i, arr) => (
              <div key={role} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-200/30 dark:border-gray-700/20' : ''}`}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm shrink-0`}>
                  <Shield size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-gray-800 dark:text-gray-200">{role}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            자주 묻는 질문
          </h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200/40 dark:border-gray-700/30 overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)' }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <span className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 flex-1">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4">
                      <div className="h-px bg-gray-200/30 dark:bg-gray-700/20 mb-3" />
                      <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="text-center pb-8">
          <div className="rounded-2xl p-6 border border-gray-200/40 dark:border-gray-700/30"
            style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)' }}
          >
            <h4 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2">
              준비되셨나요?
            </h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5">
              지금 바로 동문 네트워크에 참여하세요.
            </p>
            <div className="flex gap-2 justify-center">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13px] font-semibold hover:opacity-90 transition-opacity"
              >
                시작하기
              </Link>
              <Link
                href="/demo"
                className="px-5 py-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 text-[13px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all"
              >
                데모 보기
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
