'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Wallet, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateTime, formatCurrency, cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import Avatar from '@/components/Avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Meeting, RSVPStatus } from '@/types';

const rsvpButtons: { value: RSVPStatus; label: string }[] = [
  { value: 'ATTENDING', label: '참석' },
  { value: 'NOT_ATTENDING', label: '불참' },
  { value: 'MAYBE', label: '미정' },
];

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: meeting, isLoading } = useQuery({
    queryKey: ['meeting', id],
    queryFn: () => api<Meeting>(`/meetings/${id}`),
  });

  const rsvpMutation = useMutation({
    mutationFn: (rsvp: RSVPStatus) =>
      api(`/meetings/${id}/rsvp`, { method: 'POST', body: JSON.stringify({ rsvp }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meeting', id] }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!meeting) return null;

  const myRsvp = meeting.members?.find((m) => m.userId === user?.id)?.rsvp;

  return (
    <div className="px-4">
      <button onClick={() => router.back()} className="py-4">
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-xl font-bold mb-4">{meeting.title}</h1>

      <div className="card p-4 space-y-3 mb-4">
        <div className="flex items-center gap-3 text-sm">
          <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
          {formatDateTime(meeting.date)}
        </div>
        {meeting.location && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
            {meeting.location}
          </div>
        )}
        {meeting.fee > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <Wallet size={16} className="text-gray-400 dark:text-gray-500" />
            참가비: {formatCurrency(meeting.fee)}
          </div>
        )}
        <div className="flex items-center gap-3 text-sm">
          <Users size={16} className="text-gray-400 dark:text-gray-500" />
          참석: {meeting.members?.filter((m) => m.rsvp === 'ATTENDING').length || 0}
          {meeting.maxMembers && `/${meeting.maxMembers}`}명
        </div>
      </div>

      {meeting.description && (
        <div className="card p-4 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{meeting.description}</p>
        </div>
      )}

      {/* RSVP Buttons */}
      <div className="flex gap-2 mb-6">
        {rsvpButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => rsvpMutation.mutate(btn.value)}
            className={cn(
              'flex-1 py-3 rounded-xl text-sm font-medium transition-colors',
              myRsvp === btn.value
                ? 'bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white backdrop-blur-md'
                : 'bg-gray-100/60 text-gray-500 hover:bg-gray-200/60 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:bg-gray-700/60'
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Members */}
      <h2 className="font-semibold mb-3">참석자 목록</h2>
      <div className="space-y-2">
        {meeting.members?.map((member) => (
          <div key={member.id} className="flex items-center gap-3 py-2">
            <Avatar src={member.user?.profileImage} name={member.user?.name || ''} size="sm" />
            <span className="text-sm font-medium flex-1">{member.user?.name}</span>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              member.rsvp === 'ATTENDING' && 'bg-green-100 text-green-700',
              member.rsvp === 'NOT_ATTENDING' && 'bg-red-100 text-red-700',
              member.rsvp === 'MAYBE' && 'bg-yellow-100 text-yellow-700',
            )}>
              {member.rsvp === 'ATTENDING' ? '참석' : member.rsvp === 'NOT_ATTENDING' ? '불참' : '미정'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
