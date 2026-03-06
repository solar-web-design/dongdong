'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { DirectMessage, CursorResponse, User } from '@/types';

export default function DMChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: targetUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api<User>(`/users/${userId}`),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['dm', userId],
    queryFn: () => api<CursorResponse<DirectMessage>>(`/dm/${userId}`, { params: { limit: 50 } }),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api(`/dm/${userId}`, { method: 'POST', body: JSON.stringify({ content }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm', userId] });
      setMessage('');
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  useEffect(() => {
    api(`/dm/${userId}/read`, { method: 'PATCH' }).catch(() => {});
  }, [userId]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        {targetUser && (
          <>
            <Avatar src={targetUser.profileImage} name={targetUser.name} size="sm" />
            <span className="font-semibold">{targetUser.name}</span>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          data?.data.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[70%] px-4 py-2 rounded-2xl text-sm',
                    isMe
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-br-md'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-md'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex gap-2 mb-16 md:mb-0">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !sendMutation.isPending && sendMutation.mutate(message)}
          placeholder="메시지 입력"
          className="input-field flex-1"
        />
        <button
          onClick={() => sendMutation.mutate(message)}
          disabled={!message.trim() || sendMutation.isPending}
          className="btn-primary !px-4"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
