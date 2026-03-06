import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return `${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

export function getRoleBadge(role: string): { label: string; color: string } {
  const roles: Record<string, { label: string; color: string }> = {
    PRESIDENT: { label: '회장', color: 'bg-yellow-100 text-yellow-800' },
    VICE_PRESIDENT: { label: '부회장', color: 'bg-blue-100 text-blue-800' },
    TREASURER: { label: '총무', color: 'bg-green-100 text-green-800' },
    MEMBER: { label: '회원', color: 'bg-gray-100 text-gray-600' },
  };
  return roles[role] || roles.MEMBER;
}

export function getCategoryLabel(category: string): string {
  const categories: Record<string, string> = {
    FREE: '자유',
    NEWS: '소식',
    JOB: '취업',
    MARKETPLACE: '장터',
  };
  return categories[category] || category;
}

export function getInitials(name: string): string {
  return name.slice(0, 1);
}
