'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import type { ChatMessage } from '@/types';

export function useChatRoom(roomId: string) {
  const { emit, on } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    emit('join_room', roomId);

    const offNewMessage = on('new_message', (msg: unknown) => {
      setMessages((prev) => [...prev, msg as ChatMessage]);
    });

    const offTyping = on('typing', (data: unknown) => {
      const { userId } = data as { userId: string; roomId: string };
      setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      }, 3000);
    });

    return () => {
      emit('leave_room', roomId);
      offNewMessage();
      offTyping();
    };
  }, [roomId, emit, on]);

  const sendMessage = useCallback(
    (content: string, images?: string[]) => {
      emit('send_message', { roomId, content, images });
    },
    [roomId, emit]
  );

  const sendTyping = useCallback(() => {
    emit('typing', { roomId });
  }, [roomId, emit]);

  const markRead = useCallback(() => {
    emit('read_messages', { roomId });
  }, [roomId, emit]);

  return { messages, setMessages, typingUsers, sendMessage, sendTyping, markRead };
}
