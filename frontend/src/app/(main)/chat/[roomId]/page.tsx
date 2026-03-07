'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, ImagePlus, LogOut, X } from 'lucide-react';
import { api, apiUpload, resizeImage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useChatRoom } from '@/hooks/useChatRoom';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { ChatMessage, CursorResponse } from '@/types';

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const { messages: realtimeMessages, typingUsers, sendMessage, sendTyping, markRead } =
    useChatRoom(roomId);

  const { data, isLoading } = useQuery({
    queryKey: ['chatMessages', roomId],
    queryFn: () =>
      api<CursorResponse<ChatMessage>>(`/chat/rooms/${roomId}/messages`, { params: { limit: 50 } }),
  });

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
    if (!input.trim() && imageUrls.length === 0) return;
    sendMessage(input || ' ', imageUrls.length > 0 ? imageUrls : undefined);
    setInput('');
    setImageUrls([]);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => sendTyping(), 300);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const resized = await resizeImage(file);
        const formData = new FormData();
        formData.append('file', resized);
        const res = await apiUpload<{ url: string }>('/upload/image', formData);
        setImageUrls((prev) => [...prev, res.url]);
      }
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLeave = async () => {
    if (!confirm('채팅방을 나가시겠습니까?')) return;
    try {
      await api(`/chat/rooms/${roomId}/leave`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      router.replace('/chat');
    } catch {
      alert('채팅방 나가기에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => router.push('/chat')}>
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold flex-1">채팅방</span>
        <button
          onClick={handleLeave}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 hover:text-red-500 transition-colors"
          title="채팅방 나가기"
        >
          <LogOut size={18} />
        </button>
      </div>

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
                  {msg.images && msg.images.length > 0 && (
                    <div className={cn('flex flex-wrap gap-1 mb-1', isMe && 'justify-end')}>
                      {msg.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="max-w-[200px] max-h-[200px] rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                  {msg.content && msg.content.trim() && (
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
                  )}
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

      {imageUrls.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative shrink-0">
              <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex gap-2 mb-16 md:mb-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ImagePlus size={20} />
        </button>
        <input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={uploading ? '업로드 중...' : '메시지 입력'}
          className="input-field flex-1"
          disabled={uploading}
        />
        <button onClick={handleSend} disabled={(!input.trim() && imageUrls.length === 0) || uploading} className="btn-primary !px-4">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
