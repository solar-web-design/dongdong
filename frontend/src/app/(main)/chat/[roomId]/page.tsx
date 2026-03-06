'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Send, ImagePlus, Settings } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useChatRoom } from '@/hooks/useChatRoom';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { ChatMessage, CursorResponse } from '@/types';

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const { messages: realtimeMessages, typingUsers, sendMessage, sendTyping, markRead } =
    useChatRoom(roomId);

  const { data, isLoading } = useQuery({
    queryKey: ['chatMessages', roomId],
    queryFn: () =>
      api<CursorResponse<ChatMessage>>(`/chat/rooms/${roomId}/messages`, { params: { limit: 50 } }),
  });

  // Merge historical + realtime messages
  const allMessages = [
    ...(data?.data || []),
    ...realtimeMessages.filter(
      (rm) => !data?.data.some((dm) => dm.id === rm.id)
    ),
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  useEffect(() => {
    markRead();
  }, [markRead]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => sendTyping(), 300);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold flex-1">채팅방</span>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <Settings size={18} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          allMessages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={cn('flex gap-2', isMe && 'flex-row-reverse')}>
                {!isMe && (
                  <Avatar src={msg.sender?.profileImage} name={msg.sender?.name || ''} size="sm" />
                )}
                <div className={cn('max-w-[70%]', isMe && 'text-right')}>
                  {!isMe && <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{msg.sender?.name}</div>}
                  <div
                    className={cn(
                      'inline-block px-4 py-2 rounded-2xl text-sm',
                      isMe
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-br-md'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-md'
                    )}
                  >
                    {msg.content}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            입력 중...
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex gap-2 mb-16 md:mb-0">
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ImagePlus size={20} />
        </button>
        <input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지 입력"
          className="input-field flex-1"
        />
        <button onClick={handleSend} disabled={!input.trim()} className="btn-primary !px-4">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
