'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Building2, Link2, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { getRoleBadge } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { User } from '@/types';

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => api<User>(`/users/${id}`),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!member) return null;

  const role = getRoleBadge(member.role);

  return (
    <div className="px-4">
      <button onClick={() => router.back()} className="py-4">
        <ArrowLeft size={20} />
      </button>

      <div className="text-center mb-6">
        <Avatar src={member.profileImage} name={member.name} size="xl" className="mx-auto mb-3" />
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-xl font-bold">{member.name}</h1>
          {member.role !== 'MEMBER' && <Badge className={role.color}>{role.label}</Badge>}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {member.department} {member.admissionYear && `· ${member.admissionYear}학번`}
        </p>
      </div>

      {member.bio && (
        <div className="card p-4 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">{member.bio}</p>
        </div>
      )}

      <div className="card p-4 space-y-3 mb-6">
        {member.location && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
            <span>{member.location}</span>
          </div>
        )}
        {(member.company || member.position) && (
          <div className="flex items-center gap-3 text-sm">
            <Building2 size={16} className="text-gray-400 dark:text-gray-500" />
            <span>{[member.company, member.position].filter(Boolean).join(' / ')}</span>
          </div>
        )}
        {member.website && (
          <div className="flex items-center gap-3 text-sm">
            <Link2 size={16} className="text-gray-400 dark:text-gray-500" />
            <a href={member.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {member.website}
            </a>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/dm/write?to=${member.id}`)}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <MessageCircle size={18} />
          편지 보내기
        </button>
      </div>
    </div>
  );
}
