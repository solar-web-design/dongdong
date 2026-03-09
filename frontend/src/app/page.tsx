'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  MessageCircle,
  Users,
  Calendar,
  Heart,
  CreditCard,
  Megaphone,
  Send,
  Bell,
  ArrowDown,
  Sparkles,
  BookOpen,
  Monitor,
  ChevronRight,
  Building2,
  Search,
  ExternalLink,
} from 'lucide-react';

const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || 'http://localhost:3000/oauth/kakao')}&response_type=code`;
const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/google')}&response_type=code&scope=email%20profile`;

/* ── 떠다니는 미니 앱 스크린 목업 ── */
const floatingCards: {
  id: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotate: string;
  delay: string;
  duration: string;
  layer: 'back' | 'mid' | 'front';
  content: React.ReactNode;
}[] = [
  {
    id: 1,
    top: '6%',
    left: '4%',
    rotate: '-6deg',
    delay: '0.8s',
    duration: '7s',
    layer: 'mid',
    content: (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
            <MessageCircle size={13} className="text-white" />
          </div>
          <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">동문 채팅</span>
        </div>
        <div className="space-y-1.5">
          <div className="bg-gray-100/80 dark:bg-gray-700/60 rounded-2xl rounded-bl-sm px-3 py-2 text-[10px] text-gray-600 dark:text-gray-300 max-w-[130px] leading-relaxed">
            다들 이번 모임 참석 가능해? 🙋
          </div>
          <div className="bg-gray-900 dark:bg-gray-100 rounded-2xl rounded-br-sm px-3 py-2 text-[10px] text-white dark:text-gray-900 max-w-[90px] ml-auto">
            당연하지! 👋
          </div>
          <div className="bg-gray-100/80 dark:bg-gray-700/60 rounded-2xl rounded-bl-sm px-3 py-2 text-[10px] text-gray-600 dark:text-gray-300 max-w-[100px]">
            나도 갈게~
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    top: '3%',
    right: '6%',
    rotate: '5deg',
    delay: '1.2s',
    duration: '8s',
    layer: 'back',
    content: (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
            <Users size={13} className="text-white" />
          </div>
          <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">동문 42명</span>
        </div>
        <div className="space-y-1.5">
          {[
            { name: '김민수', dept: '경영 08', color: 'from-orange-300 to-rose-400' },
            { name: '이지현', dept: '컴공 12', color: 'from-sky-300 to-blue-400' },
            { name: '박서준', dept: '경제 15', color: 'from-violet-300 to-purple-400' },
          ].map((m) => (
            <div key={m.name} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${m.color} shadow-sm`} />
              <span className="text-[10px] text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-gray-300">{m.name}</span>{' '}
                {m.dept}
              </span>
            </div>
          ))}
          <div className="text-[9px] text-gray-400 dark:text-gray-500 pl-7">외 39명</div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    bottom: '24%',
    left: '2%',
    rotate: '4deg',
    delay: '1.6s',
    duration: '9s',
    layer: 'front',
    content: (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-sm">
            <Calendar size={13} className="text-white" />
          </div>
          <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">다가오는 모임</span>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30 px-3 py-2.5 space-y-1">
          <div className="absolute top-0 right-0 w-12 h-12 bg-purple-200/30 dark:bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="text-[11px] font-bold text-gray-800 dark:text-gray-200">2026 봄 정기모임</div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400">3월 22일 (토) · 오후 6시</div>
          <div className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-medium">
            <div className="flex -space-x-1">
              {['from-orange-300 to-rose-400', 'from-sky-300 to-blue-400', 'from-emerald-300 to-green-400'].map((c, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${c} border border-white dark:border-gray-800`} />
              ))}
            </div>
            12명 참석 예정
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    bottom: '20%',
    right: '3%',
    rotate: '-7deg',
    delay: '2s',
    duration: '7.5s',
    layer: 'mid',
    content: (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shadow-sm">
            <Heart size={13} className="text-white" />
          </div>
          <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">인기 게시글</span>
        </div>
        <div className="space-y-2">
          <div>
            <div className="text-[11px] font-medium text-gray-800 dark:text-gray-200 leading-snug">
              졸업 후 10년, 근황 토크 🎓
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">김민수 · 2시간 전</div>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-rose-500">
              <Heart size={10} fill="currentColor" /> 24
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <MessageCircle size={10} /> 8
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    top: '36%',
    left: '0%',
    rotate: '-3deg',
    delay: '2.4s',
    duration: '8.5s',
    layer: 'back',
    content: (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <CreditCard size={13} className="text-white" />
          </div>
          <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">회비 현황</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-500 dark:text-gray-400">2026년 연회비</span>
            <span className="text-emerald-500 font-semibold text-[9px] px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
              납부완료
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 rounded-full" />
          </div>
          <div className="text-[9px] text-gray-400 dark:text-gray-500">32/40명 납부 (80%)</div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    top: '38%',
    right: '1%',
    rotate: '8deg',
    delay: '2.8s',
    duration: '7s',
    layer: 'front',
    content: (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-cyan-600 flex items-center justify-center shadow-sm">
            <Megaphone size={13} className="text-white" />
          </div>
          <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">공지사항</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5">
            <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <div>
              <div className="text-[11px] font-medium text-gray-800 dark:text-gray-200">총회 일정 안내</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                2026년도 정기총회를 개최합니다
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

/* ── 기능 카드 데이터 ── */
const features = [
  {
    icon: MessageCircle,
    label: '실시간 채팅',
    desc: '동문끼리 자유롭게',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Users,
    label: '동문 네트워크',
    desc: '학과·기수별 연결',
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    icon: Calendar,
    label: '모임 관리',
    desc: 'RSVP로 간편하게',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
  },
  {
    icon: CreditCard,
    label: '회비 관리',
    desc: '투명한 회계장부',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: Bell,
    label: '실시간 알림',
    desc: '놓치지 않는 소식',
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  {
    icon: Send,
    label: '쪽지',
    desc: '1:1 프라이빗 DM',
    gradient: 'from-sky-500 to-cyan-600',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
  },
];

interface TenantSearchResult {
  id: string;
  name: string;
  universityName: string;
  slug: string;
  description?: string;
}

function FindMyAlumni() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TenantSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api<{ data: TenantSearchResult[] }>(`/tenants/search?q=${encodeURIComponent(query.trim())}`);
      setResults(res.data);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const domain = typeof window !== 'undefined'
    ? window.location.hostname.replace(/^[^.]+\./, '').replace(/^www\./, '') || 'aidongdong.co.kr'
    : 'aidongdong.co.kr';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';

  return (
    <section className="relative px-5 pb-16 pt-4">
      <div className="max-w-lg mx-auto">
        <div className="rounded-2xl p-6 border border-teal-200/25 dark:border-teal-500/15 bg-white/40 dark:bg-gray-900/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} className="text-teal-500 dark:text-teal-400" />
            <h3 className="text-[16px] font-bold text-gray-800 dark:text-gray-200">내 동문회 찾기</h3>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
            대학명 또는 동문회 이름으로 검색하세요
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="예: 한양대, 경영학과 동문회"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/50 text-[14px] placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-5 py-3 rounded-xl text-white font-semibold text-[14px] hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-indigo-500/20"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              }}
            >
              {loading ? '...' : '검색'}
            </button>
          </div>

          {searched && (
            <div className="mt-4">
              {results.length === 0 ? (
                <div className="text-center py-6 text-[13px] text-gray-400 dark:text-gray-500">
                  검색 결과가 없습니다.{' '}
                  <Link href="/tenant-request" className="text-gray-700 dark:text-gray-300 font-semibold hover:underline">
                    동문회를 개설해보세요
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((t) => (
                    <a
                      key={t.id}
                      href={`${protocol}//${t.slug}.${domain}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-200/40 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                    >
                      <div>
                        <div className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">{t.name}</div>
                        <div className="text-[12px] text-gray-500 dark:text-gray-400">{t.universityName}</div>
                        {t.description && (
                          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{t.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0 ml-3">
                        <span className="hidden sm:inline">{t.slug}.{domain}</span>
                        <ExternalLink size={14} />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── 로고 SVG 옵션들 ── */
const LogoOptionA = () => (
  /* A: 브릿지 — 두 d의 줄기가 아치로 연결 (연결/네트워크) */
  <svg viewBox="0 0 40 40" fill="none" className="w-[34px] h-[34px]">
    <path d="M11 12V30" stroke="white" strokeWidth="3.2" strokeLinecap="round"/>
    <path d="M11 22.5a5.5 5.5 0 1 0 0 5" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
    <path d="M29 12V30" stroke="white" strokeWidth="3.2" strokeLinecap="round"/>
    <path d="M29 22.5a5.5 5.5 0 1 1 0 5" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
    <path d="M11 12C11 6 29 6 29 12" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
  </svg>
);

/* 최종 로고: 브릿지 dd */
const BridgeLogo = LogoOptionA;

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/feed');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative bg-[#f8f7ff] dark:bg-[#0a0a10] overflow-x-hidden">
      {/* ── 그레인 텍스처 오버레이 ── */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] dark:opacity-[0.04] will-change-auto"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* ══════════ SECTION 1: HERO ══════════ */}
      <section className="relative min-h-screen flex flex-col">
        {/* ── 배경 메쉬 그라데이션 ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 인디고-바이올렛 주 그라데이션 (좌상) */}
          <div
            className="absolute w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] rounded-full opacity-40 dark:opacity-15 blur-3xl"
            style={{
              top: '-20%',
              left: '-10%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.2) 35%, transparent 70%)',
            }}
          />
          {/* 티얼-시안 보조 (우상) */}
          <div
            className="absolute w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full opacity-30 dark:opacity-12 blur-3xl"
            style={{
              top: '10%',
              right: '-15%',
              background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, rgba(6,182,212,0.15) 35%, transparent 70%)',
            }}
          />
          {/* 블루-인디고 하단 */}
          <div
            className="absolute w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full opacity-25 dark:opacity-10 blur-3xl"
            style={{
              bottom: '-10%',
              left: '20%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(99,102,241,0.12) 40%, transparent 70%)',
            }}
          />
          {/* 앰버-오렌지 포인트 (우하) */}
          <div
            className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full opacity-20 dark:opacity-[0.08] blur-3xl"
            style={{
              bottom: '5%',
              right: '-5%',
              background: 'radial-gradient(circle, rgba(251,146,60,0.25) 0%, rgba(245,158,11,0.1) 40%, transparent 70%)',
            }}
          />
        </div>

        {/* ── 떠다니는 앱 스크린 목업 (데스크탑) ── */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {floatingCards.map((card) => {
            const layerScale = card.layer === 'back' ? 0.85 : card.layer === 'front' ? 1.05 : 1;
            const layerOpacity = card.layer === 'back' ? 0.5 : card.layer === 'front' ? 0.85 : 0.7;
            return (
              <div
                key={card.id}
                className="absolute w-[210px]"
                style={{
                  top: card.top,
                  left: card.left,
                  right: card.right,
                  bottom: card.bottom,
                  opacity: mounted ? layerOpacity : 0,
                  transform: `rotate(${card.rotate}) scale(${layerScale}) translateY(${mounted ? '0' : '30px'})`,
                  transition: `all 1s cubic-bezier(0.16, 1, 0.3, 1) ${card.delay}`,
                  animation: mounted ? `landing-float ${card.duration} ease-in-out ${card.delay} infinite` : 'none',
                }}
              >
                <div className="rounded-2xl p-4 border shadow-xl bg-white/55 dark:bg-gray-900/50 backdrop-blur-[20px] backdrop-saturate-150 border-white/50 dark:border-gray-700/40 shadow-[0_8px_32px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.1)]">
                  {card.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 떠다니는 목업 (태블릿 md~lg) ── */}
        <div className="absolute inset-0 pointer-events-none hidden md:block lg:hidden">
          {floatingCards.slice(0, 4).map((card) => (
            <div
              key={card.id}
              className="absolute w-[180px]"
              style={{
                top: card.top,
                left: card.left,
                right: card.right,
                bottom: card.bottom,
                opacity: mounted ? 0.5 : 0,
                transform: `rotate(${card.rotate}) scale(0.9) translateY(${mounted ? '0' : '30px'})`,
                transition: `all 1s cubic-bezier(0.16, 1, 0.3, 1) ${card.delay}`,
                animation: mounted ? `landing-float ${card.duration} ease-in-out ${card.delay} infinite` : 'none',
              }}
            >
              <div className="rounded-2xl p-3.5 border shadow-lg bg-white/50 dark:bg-gray-900/45 backdrop-blur-[16px] backdrop-saturate-[1.4] border-white/40 dark:border-gray-700/35">
                {card.content}
              </div>
            </div>
          ))}
        </div>

        {/* ── 모바일 배경 카드 ── */}
        <div className="absolute inset-0 pointer-events-none md:hidden">
          {[
            { card: floatingCards[0], style: { top: '3%', right: '-30px', transform: 'rotate(8deg) scale(0.8)' } },
            { card: floatingCards[3], style: { bottom: '22%', left: '-40px', transform: 'rotate(-6deg) scale(0.75)' } },
          ].map(({ card, style }, i) => (
            <div
              key={card.id}
              className="absolute w-[180px]"
              style={{
                ...style,
                opacity: mounted ? 0.35 : 0,
                transition: `opacity 1.2s ease ${0.6 + i * 0.4}s`,
                animation: mounted ? `landing-float 8s ease-in-out ${i * 2}s infinite` : 'none',
              }}
            >
              <div className="rounded-2xl p-3 border bg-white/45 dark:bg-gray-900/40 backdrop-blur-[12px] border-white/30 dark:border-gray-700/30">
                {card.content}
              </div>
            </div>
          ))}
        </div>

        {/* ── 메인 콘텐츠 ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-16">
          <div className="max-w-[420px] w-full">
            {/* 로고 */}
            <div
              className="text-center mb-8"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              }}
            >
              <div className="relative inline-block mb-5">
                {/* 잉크 퍼짐 효과 링 */}
                <div
                  className="absolute inset-0 rounded-[20px] scale-[1.35]"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transition: 'opacity 1.5s ease 0.5s',
                    background: 'conic-gradient(from 0deg, rgba(99,102,241,0.25), rgba(20,184,166,0.2), rgba(251,146,60,0.2), rgba(139,92,246,0.25), rgba(99,102,241,0.25))',
                    filter: 'blur(8px)',
                    animation: 'spin 12s linear infinite',
                  }}
                />
                <div
                  className="relative w-[72px] h-[72px] rounded-[20px] flex items-center justify-center shadow-2xl shadow-indigo-900/25 dark:shadow-indigo-400/15"
                  style={{
                    background: 'linear-gradient(135deg, #312e81 0%, #4338ca 40%, #6366f1 100%)',
                  }}
                >
                  <BridgeLogo />
                </div>
              </div>
              <h1 className="text-[42px] font-extrabold tracking-tight text-gray-950 dark:text-white leading-none">
                동동
              </h1>
              <p className="mt-1.5 text-[13px] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500 font-medium">
                Alumni Network
              </p>
            </div>

            {/* 슬로건 */}
            <div
              className="text-center mb-9"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
              }}
            >
              <h2 className="text-[22px] md:text-[26px] font-bold leading-[1.35] text-gray-800 dark:text-gray-100">
                졸업 후에도 이어지는
                <br />
                <span
                  className="relative inline-block"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #6366f1, #14b8a6, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  우리들의 네트워크
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full opacity-50"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #6366f1, #14b8a6, #f59e0b)',
                    }}
                  />
                </span>
              </h2>
              <p className="mt-4 text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
                게시판 · 채팅 · 모임 · 회비관리까지
                <br />
                동문 커뮤니티의 모든 것을 한곳에서
              </p>
            </div>

            {/* 기능 태그 */}
            <div
              className="flex flex-wrap justify-center gap-2 mb-9"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
              }}
            >
              {features.map(({ icon: Icon, label, gradient }, i) => (
                <div
                  key={label}
                  className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-medium text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-default bg-white/50 dark:bg-gray-800/40 backdrop-blur-[8px]"
                  style={{
                    transitionDelay: `${i * 50}ms`,
                  }}
                >
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon size={9} className="text-white" />
                  </div>
                  {label}
                </div>
              ))}
            </div>

            {/* 로그인 카드 */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s',
              }}
            >
              <div
                className="rounded-[20px] p-6 space-y-3 border bg-white/65 dark:bg-gray-900/55 backdrop-blur-[24px] backdrop-saturate-150 border-indigo-200/30 dark:border-indigo-500/20 shadow-[0_20px_60px_rgba(99,102,241,0.08),0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.15)]"
              >
                <a
                  href={KAKAO_AUTH_URL}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl font-semibold text-[14px] transition-all duration-200 hover:brightness-[0.97] active:scale-[0.98]"
                  style={{ backgroundColor: '#FEE500', color: '#191919' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.48 3 2 6.58 2 10.95c0 2.82 1.86 5.29 4.66 6.69-.15.56-.95 3.6-.98 3.83 0 0-.02.17.09.24.1.06.23.03.23.03.3-.04 3.54-2.32 4.1-2.71.6.09 1.23.13 1.9.13 5.52 0 10-3.58 10-7.95S17.52 3 12 3z" />
                  </svg>
                  카카오 로그인
                </a>
                <a
                  href={GOOGLE_AUTH_URL}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl font-semibold text-[14px] border transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80 active:scale-[0.98] bg-white/70 dark:bg-gray-800/50 border-black/[0.08] dark:border-white/10 text-gray-700 dark:text-gray-300"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google 로그인
                </a>
                <Link
                  href="/login"
                  className="flex items-center justify-center w-full px-6 py-3.5 rounded-xl font-semibold text-[14px] text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
                  }}
                >
                  이메일 로그인
                </Link>
              </div>
            </div>

            {/* 회원가입 */}
            <div
              className="mt-6 text-center"
              style={{
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.8s ease 1s',
              }}
            >
              <span className="text-[13px] text-gray-400 dark:text-gray-500">
                아직 회원이 아니신가요?{' '}
              </span>
              <Link
                href="/register"
                className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
              >
                가입 신청
              </Link>
            </div>
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div
          className="relative z-10 flex justify-center pb-8"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1.5s ease 1.5s',
          }}
        >
          <div className="flex flex-col items-center gap-2 text-indigo-400 dark:text-indigo-500 animate-bounce">
            <span className="text-[10px] tracking-widest uppercase font-medium">Features</span>
            <ArrowDown size={14} />
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 2: FEATURES ══════════ */}
      <section className="relative px-5 pb-24 pt-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mb-4">
              <Sparkles size={12} />
              동문을 위한 올인원 플랫폼
            </div>
            <h3 className="text-[20px] md:text-[24px] font-bold text-gray-900 dark:text-white leading-tight">
              필요한 모든 기능,
              <br />
              <span className="text-indigo-400 dark:text-indigo-500">하나의 앱에서</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc, gradient, bg }) => (
              <div
                key={label}
                className={`group relative overflow-hidden rounded-2xl p-4 ${bg} border border-gray-200/30 dark:border-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-600/40 transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon size={16} className="text-white" />
                </div>
                <div className="text-[13px] font-bold text-gray-800 dark:text-gray-200 mb-0.5">{label}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 3: GUIDE & DEMO 티저 ══════════ */}
      <section className="relative px-5 pb-20 pt-4">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 사용 가이드 티저 */}
            <Link
              href="/guide"
              className="group relative overflow-hidden rounded-2xl p-6 border border-amber-200/30 dark:border-amber-500/15 hover:border-amber-300/50 dark:hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.05) 100%)',
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 opacity-15 dark:opacity-8 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)' }}
              />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <BookOpen size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-gray-800 dark:text-gray-200">사용 가이드</div>
                  <div className="text-[11px] text-gray-400 dark:text-gray-500">처음이신가요?</div>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {['가입 신청 & 승인 절차', '게시판·채팅 활용법', '모임·회비 관리 방법'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[9px] font-bold text-gray-400 shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[12px] font-semibold text-amber-600 dark:text-amber-400 group-hover:gap-2 transition-all">
                자세히 보기 <ChevronRight size={14} />
              </div>
            </Link>

            {/* 데모 티저 */}
            <Link
              href="/demo"
              className="group relative overflow-hidden rounded-2xl p-6 border border-sky-200/30 dark:border-sky-500/15 hover:border-sky-300/50 dark:hover:border-sky-500/30 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(99,102,241,0.05) 100%)',
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 opacity-15 dark:opacity-8 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.5) 0%, transparent 70%)' }}
              />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center shadow-sm">
                  <Monitor size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-gray-800 dark:text-gray-200">화면 미리보기</div>
                  <div className="text-[11px] text-gray-400 dark:text-gray-500">어떤 기능이 있나요?</div>
                </div>
              </div>
              {/* 미니 스크린 프리뷰 */}
              <div className="flex gap-1.5 mb-4">
                {[
                  { label: '피드', color: 'from-blue-400 to-blue-500' },
                  { label: '채팅', color: 'from-emerald-400 to-emerald-500' },
                  { label: '모임', color: 'from-violet-400 to-violet-500' },
                ].map((screen) => (
                  <div key={screen.label} className="flex-1 rounded-lg bg-white/60 dark:bg-gray-800/40 border border-gray-200/30 dark:border-gray-700/20 p-2 text-center">
                    <div className={`w-full h-1 rounded-full bg-gradient-to-r ${screen.color} mb-1.5`} />
                    <div className="text-[9px] text-gray-400 dark:text-gray-500">{screen.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[12px] font-semibold text-sky-600 dark:text-sky-400 group-hover:gap-2 transition-all">
                둘러보기 <ChevronRight size={14} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 내 동문회 찾기 ── */}
      <FindMyAlumni />

      {/* ── 동문회 개설 CTA ── */}
      <section className="relative px-5 pb-16 pt-4">
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl p-6 border border-indigo-200/20 dark:border-indigo-500/15 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(20,184,166,0.04) 50%, rgba(251,146,60,0.04) 100%)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
              <Building2 size={22} className="text-white" />
            </div>
            <h3 className="text-[16px] font-bold text-gray-800 dark:text-gray-200 mb-1">동문회를 운영하고 계신가요?</h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5">
              동동에서 동문회 전용 공간을 무료로 개설하세요
            </p>
            <Link
              href="/tenant-request"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-[14px] hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
              }}
            >
              <Building2 size={16} />
              동문회 개설 신청
            </Link>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="relative px-5 pb-10 text-center">
        <div className="text-[11px] text-gray-400 dark:text-gray-600">
          &copy; 2026 <span className="text-indigo-400/70 dark:text-indigo-500/50 font-medium">동동</span>. 동문 네트워크 플랫폼.
        </div>
      </footer>
    </div>
  );
}
