'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Clock, AlertCircle, Plus, X, ChevronDown, ChevronUp, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { FeeSchedule, AccountBook } from '@/types';

const FEE_TYPES = [
  { value: 'ANNUAL', label: '연회비' },
  { value: 'MONTHLY', label: '월회비' },
  { value: 'SPECIAL', label: '특별회비' },
  { value: 'MEETING', label: '모임비' },
];

export default function FinancePage() {
  const [tab, setTab] = useState<'payments' | 'books'>('payments');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);
  const { user } = useAuthStore();
  const isTreasurer = user?.role === 'TREASURER' || user?.role === 'PRESIDENT' || user?.isSuperAdmin;
  const queryClient = useQueryClient();

  const toast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // 납부하기
  const paymentMutation = useMutation({
    mutationFn: ({ scheduleId, amount }: { scheduleId: string; amount: number }) =>
      api(`/fees/payments/${scheduleId}`, { method: 'POST', body: JSON.stringify({ amount }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['feeSchedules'] }); toast('success', '납부 신청이 완료되었습니다. 총무 확인 후 반영됩니다.'); },
    onError: (err: Error) => toast('error', err.message),
  });

  // 납부 확인 (총무)
  const confirmMutation = useMutation({
    mutationFn: (paymentId: string) =>
      api(`/fees/payments/${paymentId}/confirm`, { method: 'PATCH' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['feeSchedules'] }); queryClient.invalidateQueries({ queryKey: ['schedulePayments'] }); toast('success', '납부가 확인되었습니다.'); },
    onError: (err: Error) => toast('error', err.message),
  });

  // 회비 일정 생성
  const createScheduleMutation = useMutation({
    mutationFn: (data: { type: string; amount: number; dueDate: string; description: string }) =>
      api('/fees/schedules', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['feeSchedules'] }); setShowCreateSchedule(false); toast('success', '회비 일정이 등록되었습니다.'); },
    onError: (err: Error) => toast('error', err.message),
  });

  // 회계 항목 생성
  const createBookMutation = useMutation({
    mutationFn: (data: { type: string; amount: number; date: string; description: string; category?: string }) =>
      api('/finance/books', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accountBooks'] }); setShowCreateBook(false); toast('success', '회계 항목이 등록되었습니다.'); },
    onError: (err: Error) => toast('error', err.message),
  });

  const { data: schedules, isLoading: loadingFees } = useQuery({
    queryKey: ['feeSchedules'],
    queryFn: () => api<{ data: FeeSchedule[] }>('/fees/schedules'),
  });

  const { data: books, isLoading: loadingBooks } = useQuery({
    queryKey: ['accountBooks'],
    queryFn: () =>
      api<{ data: AccountBook[]; summary: { totalIncome: number; totalExpense: number; balance: number } }>(
        '/finance/books', { params: { limit: 50 } }
      ),
    enabled: tab === 'books',
  });

  // 스케줄별 전체 납부 목록 (총무용)
  const { data: schedulePayments } = useQuery({
    queryKey: ['schedulePayments', expandedSchedule],
    queryFn: () => api<{ data: { id: string; userId: string; amount: number; status: string; user: { id: string; name: string } }[] }>(`/fees/schedules/${expandedSchedule}/payments`),
    enabled: !!expandedSchedule && isTreasurer,
  });

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">회비 관리</h1>

      {feedback && (
        <div className={cn(
          'p-3 rounded-lg mb-4 text-sm flex items-center gap-2',
          feedback.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        )}>
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('payments')}
          className={cn('px-4 py-1.5 rounded-full text-sm font-medium', tab === 'payments' ? 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white' : 'bg-gray-100/60 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400')}
        >
          회비 납부
        </button>
        <button
          onClick={() => setTab('books')}
          className={cn('px-4 py-1.5 rounded-full text-sm font-medium', tab === 'books' ? 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white' : 'bg-gray-100/60 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400')}
        >
          회계장부
        </button>
      </div>

      {/* ── 회비 납부 탭 ── */}
      {tab === 'payments' && (
        <>
          {isTreasurer && (
            <button onClick={() => setShowCreateSchedule(true)} className="btn-primary w-full mb-4 flex items-center justify-center gap-2 text-sm !py-2.5">
              <Plus size={16} /> 회비 일정 등록
            </button>
          )}

          {showCreateSchedule && (
            <CreateScheduleForm
              onSubmit={(data) => createScheduleMutation.mutate(data)}
              onClose={() => setShowCreateSchedule(false)}
              isPending={createScheduleMutation.isPending}
            />
          )}

          {loadingFees ? <LoadingSpinner /> : !schedules?.data.length ? (
            <EmptyState title="등록된 회비 일정이 없습니다" />
          ) : (
            <div className="space-y-3">
              {schedules.data.map((schedule) => {
                const myPayment = schedule.payments?.find((p: any) => p.userId === user?.id);
                const isPaid = myPayment?.status === 'PAID';
                const isPending = myPayment?.status === 'PENDING';
                const isExpanded = expandedSchedule === schedule.id;

                return (
                  <div key={schedule.id} className="card p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{schedule.description || FEE_TYPES.find(t => t.value === schedule.type)?.label || schedule.type}</h3>
                        <p className="text-lg font-bold mt-1">{formatCurrency(schedule.amount)}</p>
                      </div>
                      {isPaid ? (
                        <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          <Check size={14} /> 납부완료
                        </span>
                      ) : isPending ? (
                        <span className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                          <Clock size={14} /> 확인중
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                          <Clock size={14} /> 미납
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">마감일: {formatDate(schedule.dueDate)}</p>

                    {!isPaid && !isPending && (
                      <button
                        className="btn-primary w-full mt-3 text-sm !py-2"
                        disabled={paymentMutation.isPending}
                        onClick={() => paymentMutation.mutate({ scheduleId: schedule.id, amount: schedule.amount })}
                      >
                        {paymentMutation.isPending ? '처리 중...' : '납부하기'}
                      </button>
                    )}

                    {/* 총무: 납부 현황 펼치기 */}
                    {isTreasurer && (
                      <button
                        onClick={() => setExpandedSchedule(isExpanded ? null : schedule.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-3 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        납부 현황 관리
                      </button>
                    )}

                    {isExpanded && isTreasurer && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                        {!schedulePayments?.data.length ? (
                          <p className="text-xs text-gray-400 text-center py-2">납부 신청이 없습니다</p>
                        ) : (
                          schedulePayments.data.map((p) => (
                            <div key={p.id} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="font-medium">{p.user.name}</span>
                                <span className="text-xs text-gray-400 ml-2">{formatCurrency(p.amount)}</span>
                              </div>
                              {p.status === 'PAID' ? (
                                <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">확인됨</span>
                              ) : (
                                <button
                                  onClick={() => confirmMutation.mutate(p.id)}
                                  disabled={confirmMutation.isPending}
                                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                  <UserCheck size={12} /> 확인
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── 회계장부 탭 ── */}
      {tab === 'books' && (
        <>
          {books?.summary && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="card p-3 text-center">
                <div className="text-xs text-gray-400 dark:text-gray-500">수입</div>
                <div className="font-bold text-green-600 text-sm">{formatCurrency(books.summary.totalIncome)}</div>
              </div>
              <div className="card p-3 text-center">
                <div className="text-xs text-gray-400 dark:text-gray-500">지출</div>
                <div className="font-bold text-red-600 text-sm">{formatCurrency(books.summary.totalExpense)}</div>
              </div>
              <div className="card p-3 text-center">
                <div className="text-xs text-gray-400 dark:text-gray-500">잔액</div>
                <div className="font-bold text-sm">{formatCurrency(books.summary.balance)}</div>
              </div>
            </div>
          )}

          {isTreasurer && (
            <button onClick={() => setShowCreateBook(true)} className="btn-primary w-full mb-4 flex items-center justify-center gap-2 text-sm !py-2.5">
              <Plus size={16} /> 회계 항목 추가
            </button>
          )}

          {showCreateBook && (
            <CreateBookForm
              onSubmit={(data) => createBookMutation.mutate(data)}
              onClose={() => setShowCreateBook(false)}
              isPending={createBookMutation.isPending}
            />
          )}

          {loadingBooks ? <LoadingSpinner /> : !books?.data.length ? (
            <EmptyState title="회계 기록이 없습니다" />
          ) : (
            <div className="space-y-2">
              {books.data.map((entry) => (
                <div key={entry.id} className="card flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{entry.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(entry.date)}
                      {entry.category && <span className="ml-1.5 text-gray-300 dark:text-gray-600">· {entry.category}</span>}
                    </p>
                  </div>
                  <span className={cn('font-semibold text-sm', entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600')}>
                    {entry.type === 'INCOME' ? '+' : '-'}{formatCurrency(entry.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── 회비 일정 생성 폼 ── */
function CreateScheduleForm({ onSubmit, onClose, isPending }: {
  onSubmit: (data: { type: string; amount: number; dueDate: string; description: string }) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({ type: 'ANNUAL', amount: '', dueDate: '', description: '' });

  return (
    <div className="card p-4 mb-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">회비 일정 등록</h3>
        <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
      </div>
      <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="input-field text-sm">
        {FEE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <input type="number" placeholder="금액" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field text-sm" />
      <input type="date" value={form.dueDate} onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field text-sm" />
      <input type="text" placeholder="설명 (예: 2026년 연회비)" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="input-field text-sm" />
      <button
        onClick={() => onSubmit({ ...form, amount: parseInt(form.amount) || 0 })}
        disabled={isPending || !form.amount || !form.dueDate}
        className="btn-primary w-full text-sm !py-2"
      >
        {isPending ? '등록 중...' : '등록'}
      </button>
    </div>
  );
}

/* ── 회계 항목 생성 폼 ── */
function CreateBookForm({ onSubmit, onClose, isPending }: {
  onSubmit: (data: { type: string; amount: number; date: string; description: string; category?: string }) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({ type: 'INCOME', amount: '', date: '', description: '', category: '' });

  return (
    <div className="card p-4 mb-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">회계 항목 추가</h3>
        <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
      </div>
      <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="input-field text-sm">
        <option value="INCOME">수입</option>
        <option value="EXPENSE">지출</option>
      </select>
      <input type="number" placeholder="금액" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field text-sm" />
      <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="input-field text-sm" />
      <input type="text" placeholder="설명 (예: 모임 장소 대관비)" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="input-field text-sm" />
      <input type="text" placeholder="분류 (선택, 예: 모임비)" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="input-field text-sm" />
      <button
        onClick={() => onSubmit({ ...form, amount: parseInt(form.amount) || 0, category: form.category || undefined })}
        disabled={isPending || !form.amount || !form.date || !form.description}
        className="btn-primary w-full text-sm !py-2"
      >
        {isPending ? '등록 중...' : '등록'}
      </button>
    </div>
  );
}
