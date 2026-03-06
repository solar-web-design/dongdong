'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { getRoleBadge } from '@/lib/utils';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import type { User, PaginatedResponse } from '@/types';

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['members', search, department, page],
    queryFn: () =>
      api<PaginatedResponse<User>>('/users', {
        params: { page, limit: 20, search: search || undefined, department: department || undefined },
      }),
  });

  return (
    <div className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">동문 찾기</h1>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="이름, 학과, 회사..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field !pl-10"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <EmptyState title="회원을 찾을 수 없습니다" />
      ) : (
        <div className="space-y-2">
          {data.data.map((member) => {
            const role = getRoleBadge(member.role);
            return (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className="card flex items-center gap-3 p-4 hover:shadow-md transition-shadow"
              >
                <Avatar src={member.profileImage} name={member.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{member.name}</span>
                    {member.role !== 'MEMBER' && (
                      <Badge className={role.color}>{role.label}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {member.department && `${member.department} `}
                    {member.admissionYear && `'${String(member.admissionYear).slice(2)}`}
                    {member.company && ` · ${member.company}`}
                    {member.position && ` / ${member.position}`}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
