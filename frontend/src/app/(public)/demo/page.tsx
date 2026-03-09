'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  CreditCard,
  Bell,
  Send,
  Search,
  Plus,
  Pin,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Settings,
  Home,
  User,
  MoreHorizontal,
  Monitor,
  Check,
  X,
} from 'lucide-react';

/* ── 데모 화면 데이터 ── */
const screens = [
  {
    id: 'feed',
    label: '피드',
    icon: Home,
    gradient: 'from-blue-500 to-blue-600',
    desc: '동문 소식을 한눈에 확인하고, 좋아요와 댓글로 소통할 수 있습니다.',
    content: (
      <div className="space-y-3">
        {/* 카테고리 탭 */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['전체', '자유', '소식', '취업', '장터'].map((c, i) => (
            <div
              key={c}
              className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-medium ${
                i === 0
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              {c}
            </div>
          ))}
        </div>

        {/* 공지 배너 */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/30 dark:border-amber-800/20 rounded-xl px-3 py-2 flex items-center gap-2">
          <Megaphone size={12} className="text-amber-500 shrink-0" />
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate">
            📌 2026 정기총회 일정 안내
          </span>
        </div>

        {/* 게시글 목록 */}
        {[
          { author: '김민수', dept: '경영 08', title: '졸업 후 10년, 근황 토크 🎓', likes: 24, comments: 8, pinned: true },
          { author: '이지현', dept: '컴공 12', title: '개발자 동문 네트워킹 모임 후기', likes: 15, comments: 5, pinned: false },
          { author: '박서준', dept: '경제 15', title: '장터 | 전공서적 무료 나눔합니다', likes: 8, comments: 3, pinned: false },
        ].map((post) => (
          <div key={post.title} className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-200/30 dark:border-gray-700/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700" />
              <div>
                <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  {post.author}
                  {post.pinned && <Pin size={9} className="text-amber-500" />}
                </div>
                <div className="text-[9px] text-gray-400">{post.dept} · 2시간 전</div>
              </div>
            </div>
            <div className="text-[11px] text-gray-700 dark:text-gray-300 mb-2">{post.title}</div>
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><Heart size={10} className="text-rose-400" /> {post.likes}</span>
              <span className="flex items-center gap-1"><MessageCircle size={10} /> {post.comments}</span>
            </div>
          </div>
        ))}

        {/* FAB */}
        <div className="flex justify-end">
          <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shadow-lg">
            <Plus size={18} className="text-white dark:text-gray-900" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'chat',
    label: '채팅',
    icon: MessageCircle,
    gradient: 'from-emerald-500 to-emerald-600',
    desc: '그룹 채팅방에서 실시간으로 동문들과 대화할 수 있습니다.',
    content: (
      <div className="space-y-2">
        {/* 채팅방 헤더 */}
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200/30 dark:border-gray-700/20">
          <ChevronLeft size={16} className="text-gray-400" />
          <span className="text-[12px] font-bold text-gray-800 dark:text-gray-200 flex-1">경영학과 08 동문방</span>
          <Users size={14} className="text-gray-400" />
        </div>

        {/* 메시지 */}
        <div className="space-y-2.5 py-1">
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-300 to-rose-400 shrink-0" />
            <div>
              <div className="text-[9px] text-gray-400 mb-0.5">김민수</div>
              <div className="bg-gray-100 dark:bg-gray-700/60 rounded-xl rounded-bl-sm px-2.5 py-1.5 text-[10px] text-gray-600 dark:text-gray-300 max-w-[160px]">
                다들 이번 모임 참석 가능해? 🙋
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-row-reverse">
            <div>
              <div className="bg-gray-900 dark:bg-gray-100 rounded-xl rounded-br-sm px-2.5 py-1.5 text-[10px] text-white dark:text-gray-900 max-w-[120px]">
                당연하지! 👋
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-300 to-blue-400 shrink-0" />
            <div>
              <div className="text-[9px] text-gray-400 mb-0.5">이지현</div>
              <div className="bg-gray-100 dark:bg-gray-700/60 rounded-xl rounded-bl-sm px-2.5 py-1.5 text-[10px] text-gray-600 dark:text-gray-300 max-w-[140px]">
                저도 갈게요~ 장소 정해졌어?
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-gray-400 dark:text-gray-500 pl-8">
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            입력 중...
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="flex gap-2 items-center pt-1 border-t border-gray-200/30 dark:border-gray-700/20">
          <Plus size={16} className="text-gray-400 shrink-0" />
          <div className="flex-1 bg-gray-100 dark:bg-gray-700/40 rounded-full px-3 py-1.5 text-[10px] text-gray-400">
            메시지 입력
          </div>
          <Send size={14} className="text-gray-400 shrink-0" />
        </div>
      </div>
    ),
  },
  {
    id: 'meeting',
    label: '모임',
    icon: Calendar,
    gradient: 'from-violet-500 to-purple-600',
    desc: '모임 일정을 관리하고 RSVP로 참석 여부를 알릴 수 있습니다.',
    content: (
      <div className="space-y-3">
        {/* 모임 카드 */}
        {[
          { title: '2026 봄 정기모임', date: '3월 22일 (토) 오후 6시', place: '강남역 OO레스토랑', count: 12, status: 'upcoming' },
          { title: '개발자 동문 스터디', date: '3월 29일 (토) 오후 2시', place: '온라인 (Zoom)', count: 8, status: 'upcoming' },
          { title: '2025 송년회', date: '12월 20일 (토)', place: '홍대 OO펍', count: 25, status: 'past' },
        ].map((m) => (
          <div key={m.title} className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-200/30 dark:border-gray-700/20">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-[12px] font-bold text-gray-800 dark:text-gray-200">{m.title}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{m.date}</div>
                <div className="text-[10px] text-gray-400">{m.place}</div>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                m.status === 'upcoming'
                  ? 'bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                {m.status === 'upcoming' ? '예정' : '종료'}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                <div className="flex -space-x-1">
                  {['from-orange-300 to-rose-400', 'from-sky-300 to-blue-400', 'from-emerald-300 to-green-400'].map((c, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full bg-gradient-to-br ${c} border-2 border-white dark:border-gray-800`} />
                  ))}
                </div>
                {m.count}명 참석
              </div>
              {m.status === 'upcoming' && (
                <div className="flex gap-1">
                  <div className="px-2 py-1 rounded-lg bg-violet-500 text-white text-[9px] font-medium flex items-center gap-0.5">
                    <Check size={8} /> 참석
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 text-[9px] font-medium flex items-center gap-0.5">
                    <X size={8} /> 불참
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'members',
    label: '회원',
    icon: Users,
    gradient: 'from-sky-500 to-cyan-600',
    desc: '동문 목록을 확인하고 프로필을 조회할 수 있습니다.',
    content: (
      <div className="space-y-3">
        {/* 검색 */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/60 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <span className="text-[11px] text-gray-400">이름, 학과로 검색</span>
        </div>

        {/* 회원 목록 */}
        {[
          { name: '김민수', dept: '경영학과 08', role: '회장', color: 'from-orange-300 to-rose-400', roleColor: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
          { name: '이지현', dept: '컴퓨터공학과 12', role: '부회장', color: 'from-sky-300 to-blue-400', roleColor: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' },
          { name: '박서준', dept: '경제학과 15', role: '총무', color: 'from-violet-300 to-purple-400', roleColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
          { name: '최유진', dept: '디자인학과 18', role: '회원', color: 'from-emerald-300 to-green-400', roleColor: 'text-gray-400 bg-gray-100 dark:bg-gray-800' },
          { name: '정태호', dept: '법학과 10', role: '회원', color: 'from-amber-300 to-orange-400', roleColor: 'text-gray-400 bg-gray-100 dark:bg-gray-800' },
        ].map((m) => (
          <div key={m.name} className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-200/30 dark:border-gray-700/20">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${m.color} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-gray-800 dark:text-gray-200">{m.name}</div>
              <div className="text-[10px] text-gray-400">{m.dept}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${m.roleColor}`}>
              {m.role}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'finance',
    label: '회비',
    icon: CreditCard,
    gradient: 'from-amber-500 to-orange-500',
    desc: '회비 납부 현황과 회계 장부를 투명하게 관리합니다.',
    content: (
      <div className="space-y-3">
        {/* 현황 요약 */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-3 border border-amber-200/30 dark:border-amber-800/20">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">2026년 연회비</div>
          <div className="text-[18px] font-black text-gray-900 dark:text-white mb-2">₩50,000</div>
          <div className="w-full h-2.5 bg-white/60 dark:bg-gray-800/40 rounded-full overflow-hidden mb-1">
            <div className="h-full w-4/5 bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 rounded-full" />
          </div>
          <div className="flex justify-between text-[9px] text-gray-400">
            <span>32/40명 납부</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">80%</span>
          </div>
        </div>

        {/* 납부 목록 */}
        <div className="text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">최근 납부</div>
        {[
          { name: '김민수', date: '3월 5일', status: 'paid' },
          { name: '이지현', date: '3월 3일', status: 'paid' },
          { name: '박서준', date: '미납', status: 'unpaid' },
        ].map((p) => (
          <div key={p.name} className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/40 rounded-xl p-2.5 border border-gray-200/30 dark:border-gray-700/20">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{p.name}</div>
              <div className="text-[9px] text-gray-400">{p.date}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
              p.status === 'paid'
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                : 'text-red-500 bg-red-50 dark:bg-red-950/30'
            }`}>
              {p.status === 'paid' ? '납부완료' : '미납'}
            </span>
          </div>
        ))}

        {/* 회계 요약 */}
        <div className="text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1 mt-2">회계 요약</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl p-2.5 text-center border border-emerald-200/20 dark:border-emerald-800/10">
            <div className="text-[9px] text-gray-400 mb-0.5">수입</div>
            <div className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">₩1,600,000</div>
          </div>
          <div className="bg-red-50/60 dark:bg-red-950/20 rounded-xl p-2.5 text-center border border-red-200/20 dark:border-red-800/10">
            <div className="text-[9px] text-gray-400 mb-0.5">지출</div>
            <div className="text-[13px] font-bold text-red-600 dark:text-red-400">₩850,000</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'dm',
    label: 'DM',
    icon: Send,
    gradient: 'from-pink-500 to-rose-600',
    desc: '동문에게 1:1 쪽지를 보내고 받을 수 있습니다.',
    content: (
      <div className="space-y-2.5">
        {/* 탭 */}
        <div className="flex gap-1">
          {['받은 쪽지', '보낸 쪽지'].map((tab, i) => (
            <div
              key={tab}
              className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-medium ${
                i === 0
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* 쪽지 목록 */}
        {[
          { from: '김민수', preview: '안녕하세요! 혹시 이번 모임에서 만나신...', time: '2시간 전', unread: true },
          { from: '이지현', preview: '개발자 스터디 참여 의사 여쭤보려고...', time: '어제', unread: true },
          { from: '박서준', preview: '전공서적 관련해서 연락드립니다 📚', time: '3일 전', unread: false },
          { from: '최유진', preview: '졸업앨범 사진 공유드립니다!', time: '1주 전', unread: false },
        ].map((dm) => (
          <div key={dm.from} className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-200/30 dark:border-gray-700/20">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700" />
              {dm.unread && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[11px] font-bold ${dm.unread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {dm.from}
                </span>
                <span className="text-[9px] text-gray-400">{dm.time}</span>
              </div>
              <div className={`text-[10px] truncate ${dm.unread ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                {dm.preview}
              </div>
            </div>
          </div>
        ))}

        {/* 쪽지 작성 FAB */}
        <div className="flex justify-end">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Send size={16} className="text-white" />
          </div>
        </div>
      </div>
    ),
  },
];

export default function DemoPage() {
  const [activeScreen, setActiveScreen] = useState(0);

  const current = screens[activeScreen];

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0c]">
      {/* 헤더 */}
      <header
        className="sticky top-0 z-30 border-b border-gray-200/40 dark:border-gray-800/40"
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
            <Monitor size={18} className="text-sky-500" />
            <h1 className="text-[16px] font-bold text-gray-900 dark:text-white">화면 미리보기</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* 인트로 */}
        <div className="text-center mb-8">
          <h2 className="text-[22px] font-bold text-gray-900 dark:text-white mb-2">
            동동 둘러보기
          </h2>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
            가입 전에 주요 화면을 미리 확인해보세요.<br />
            모바일에 최적화된 깔끔한 UI를 제공합니다.
          </p>
        </div>

        {/* 화면 선택 탭 */}
        <div className="flex gap-1.5 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {screens.map((screen, i) => {
            const Icon = screen.icon;
            const isActive = i === activeScreen;
            return (
              <button
                key={screen.id}
                onClick={() => setActiveScreen(i)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all duration-300 border ${
                  isActive
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-gray-200/40 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon size={13} />
                {screen.label}
              </button>
            );
          })}
        </div>

        {/* 폰 목업 + 화면 */}
        <div className="flex flex-col items-center mb-8">
          {/* 폰 프레임 */}
          <div className="relative w-full max-w-[320px]">
            {/* 폰 외곽 */}
            <div
              className="rounded-[32px] border-[6px] border-gray-900 dark:border-gray-200 overflow-hidden shadow-2xl shadow-black/20"
              style={{
                background: 'rgba(255,255,255,0.95)',
              }}
            >
              {/* 상태 바 */}
              <div className="bg-gray-900 dark:bg-gray-200 px-6 pt-2 pb-1 flex items-center justify-between">
                <span className="text-[10px] text-white dark:text-gray-900 font-medium">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2.5 rounded-sm border border-white/40 dark:border-gray-900/40 flex items-center justify-end px-0.5">
                    <div className="w-2 h-1.5 rounded-[1px] bg-white dark:bg-gray-900" />
                  </div>
                </div>
              </div>

              {/* 앱 헤더 */}
              <div className="bg-white dark:bg-gray-950 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[14px] font-bold text-gray-900 dark:text-white">{current.label}</span>
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-gray-400" />
                  <Bell size={16} className="text-gray-400" />
                </div>
              </div>

              {/* 화면 콘텐츠 */}
              <div className="bg-gray-50 dark:bg-gray-950 px-3.5 py-3 min-h-[420px] max-h-[420px] overflow-y-auto">
                {current.content}
              </div>

              {/* 하단 네비게이션 */}
              <div className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-2 py-2 flex items-center justify-around">
                {[
                  { icon: Home, label: '피드' },
                  { icon: MessageCircle, label: '채팅' },
                  { icon: Calendar, label: '모임' },
                  { icon: Users, label: '회원' },
                  { icon: MoreHorizontal, label: '더보기' },
                ].map(({ icon: NavIcon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <NavIcon size={16} className={label === current.label ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'} />
                    <span className={`text-[8px] ${label === current.label ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-300 dark:text-gray-600'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 좌우 화살표 */}
            <button
              onClick={() => setActiveScreen((prev) => (prev > 0 ? prev - 1 : screens.length - 1))}
              className="absolute left-[-48px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/40 flex items-center justify-center shadow-md hover:scale-105 transition-transform hidden md:flex"
            >
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setActiveScreen((prev) => (prev < screens.length - 1 ? prev + 1 : 0))}
              className="absolute right-[-48px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/40 flex items-center justify-center shadow-md hover:scale-105 transition-transform hidden md:flex"
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* 페이지 인디케이터 */}
          <div className="flex gap-1.5 mt-5">
            {screens.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveScreen(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeScreen ? 'w-6 bg-gray-900 dark:bg-white' : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 화면 설명 */}
        <div
          className="rounded-2xl p-5 border border-gray-200/40 dark:border-gray-700/30 mb-8 text-center"
          style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)' }}
        >
          <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${current.gradient} items-center justify-center mb-3 shadow-sm`}>
            <current.icon size={18} className="text-white" />
          </div>
          <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-1">
            {current.label}
          </h3>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
            {current.desc}
          </p>
        </div>

        {/* 모바일 스와이프 힌트 */}
        <div className="text-center text-[11px] text-gray-400 dark:text-gray-600 mb-8 md:hidden">
          ← 탭을 눌러 다른 화면을 확인하세요 →
        </div>

        {/* 하단 CTA */}
        <div className="text-center pb-8">
          <div
            className="rounded-2xl p-6 border border-gray-200/40 dark:border-gray-700/30"
            style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)' }}
          >
            <h4 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2">
              마음에 드셨나요?
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
                href="/guide"
                className="px-5 py-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 text-[13px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all"
              >
                사용 가이드
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
