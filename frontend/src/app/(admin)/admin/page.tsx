'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import type { Tenant, PaginatedResponse } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: () => api<PaginatedResponse<Tenant>>('/tenants', { params: { limit: 100 } }),
  });

  const tenants = data?.data || [];
  const totalUsers = tenants.reduce((sum, t) => sum + (t._count?.users || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={20} className="text-blue-500" />
            <span className="text-sm text-gray-500">등록 동문회</span>
          </div>
          <p className="text-3xl font-bold">{tenants.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-green-500" />
            <span className="text-sm text-gray-500">전체 회원</span>
          </div>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} className="text-purple-500" />
            <span className="text-sm text-gray-500">활성 동문회</span>
          </div>
          <p className="text-3xl font-bold">{tenants.filter((t) => t.status === 'ACTIVE').length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">동문회 목록</h2>
        <button
          onClick={() => router.push('/super-admin/tenants/new')}
          className="btn-primary !py-2 !px-4 text-sm"
        >
          + 동문회 추가
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">동문회</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">대학교</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">슬러그</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">회원수</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tenants.map((t) => (
              <tr
                key={t.id}
                onClick={() => router.push(`/super-admin/tenants/${t.id}`)}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-gray-500">{t.universityName}</td>
                <td className="px-4 py-3 text-gray-400">{t.slug}</td>
                <td className="px-4 py-3 text-center">{t._count?.users || 0}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    t.status === 'TRIAL' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {t.status === 'ACTIVE' ? '활성' : t.status === 'TRIAL' ? '체험' : '정지'}
                  </span>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  등록된 동문회가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
