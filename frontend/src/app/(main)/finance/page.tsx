'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { FeeSchedule, FeePayment, AccountBook } from '@/types';

export default function FinancePage() {
  const [tab, setTab] = useState<'payments' | 'books'>('payments');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { user } = useAuthStore();
  const isTreasurer = user?.role === 'TREASURER' || user?.role === 'PRESIDENT';
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: ({ scheduleId, amount }: { scheduleId: string; amount: number }) =>
      api(`/fees/payments/${scheduleId}`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeSchedules'] });
      setFeedback({ type: 'success', message: '납부가 완료되었습니다.' });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (error: Error) => {
      setFeedback({ type: 'error', message: error.message || '납부 처리 중 오류가 발생했습니다.' });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const { data: schedules, isLoading: loadingFees } = useQuery({
    queryKey: ['feeSchedules'],
    queryFn: () => api<{ data: FeeSchedule[] }>('/fees/schedules'),
  });

  const { data: books, isLoading: loadingBooks } = useQuery({
    queryKey: ['accountBooks'],
    queryFn: () =>
      api<{ data: AccountBook[]; summary: { totalIncome: number; totalExpense: number; balance: number } }>(
        '/finance/books',
        { params: { limit: 50 } }
      ),
    enabled: tab === 'books',
  });

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">회비 관리</h1>

      {/* Summary */}
      {books?.summary && (
        <div className="card p-4 mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">총 잔액</div>
          <div className="text-2xl font-bold">{formatCurrency(books.summary.balance)}</div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={cn(
            'p-3 rounded-lg mb-4 text-sm flex items-center gap-2',
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          )}
        >
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('payments')}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium',
            tab === 'payments' ? 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white backdrop-blur-md' : 'bg-gray-100/60 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400'
          )}
        >
          내 납부내역
        </button>
        {isTreasurer && (
          <button
            onClick={() => setTab('books')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium',
              tab === 'books' ? 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white backdrop-blur-md' : 'bg-gray-100/60 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400'
            )}
          >
            회계장부
          </button>
        )}
      </div>

      {tab === 'payments' && (
        loadingFees ? <LoadingSpinner /> : !schedules?.data.length ? (
          <EmptyState title="납부 내역이 없습니다" />
        ) : (
          <div className="space-y-3">
            {schedules.data.map((schedule) => {
              const payment = schedule.payments?.find((p) => p.userId === user?.id);
              const isPaid = payment?.status === 'PAID';
              return (
                <div key={schedule.id} className="card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{schedule.description || schedule.type}</h3>
                      <p className="text-lg font-bold mt-1">{formatCurrency(schedule.amount)}</p>
                    </div>
                    {isPaid ? (
                      <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        <Check size={14} /> 납부
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                        <Clock size={14} /> 미납
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">마감일: {formatDate(schedule.dueDate)}</p>
                  {!isPaid && (
                    <button
                      className="btn-primary w-full mt-3 text-sm !py-2"
                      disabled={paymentMutation.isPending}
                      onClick={() =>
                        paymentMutation.mutate({
                          scheduleId: schedule.id,
                          amount: schedule.amount,
                        })
                      }
                    >
                      {paymentMutation.isPending ? '처리 중...' : '납부하기'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'books' && (
        loadingBooks ? <LoadingSpinner /> : !books?.data.length ? (
          <EmptyState title="회계 기록이 없습니다" />
        ) : (
          <>
            <div className="flex gap-4 mb-4">
              <div className="card flex-1 p-3 text-center">
                <div className="text-xs text-gray-400 dark:text-gray-500">수입</div>
                <div className="font-bold text-green-600">{formatCurrency(books.summary.totalIncome)}</div>
              </div>
              <div className="card flex-1 p-3 text-center">
                <div className="text-xs text-gray-400 dark:text-gray-500">지출</div>
                <div className="font-bold text-red-600">{formatCurrency(books.summary.totalExpense)}</div>
              </div>
            </div>
            <div className="space-y-2">
              {books.data.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium">{entry.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(entry.date)}</p>
                  </div>
                  <span className={cn(
                    'font-semibold text-sm',
                    entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {entry.type === 'INCOME' ? '+' : '-'}{formatCurrency(entry.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}
