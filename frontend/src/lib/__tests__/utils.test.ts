import { cn, formatRelativeTime, formatDate, formatDateTime, formatCurrency, getRoleBadge, getCategoryLabel, getInitials } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});

describe('formatRelativeTime', () => {
  it('returns 방금 전 for less than 60 seconds', () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe('방금 전');
  });

  it('returns minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe('5분 전');
  });

  it('returns hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe('3시간 전');
  });

  it('returns days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe('2일 전');
  });

  it('returns formatted date for 7+ days', () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date.toISOString());
    expect(result).toMatch(/\d+\.\s*\d+\.\s*\d+\./);
  });
});

describe('formatDate', () => {
  it('formats date in Korean locale', () => {
    const result = formatDate('2024-01-15T00:00:00Z');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/01/);
    expect(result).toMatch(/15/);
  });
});

describe('formatDateTime', () => {
  it('includes date and time', () => {
    const result = formatDateTime('2024-06-15T14:30:00Z');
    expect(result).toMatch(/2024/);
  });
});

describe('formatCurrency', () => {
  it('formats number with 원 suffix', () => {
    expect(formatCurrency(10000)).toBe('10,000원');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('0원');
  });

  it('formats large numbers', () => {
    expect(formatCurrency(1500000)).toBe('1,500,000원');
  });
});

describe('getRoleBadge', () => {
  it('returns 회장 for PRESIDENT', () => {
    const badge = getRoleBadge('PRESIDENT');
    expect(badge.label).toBe('회장');
    expect(badge.color).toContain('yellow');
  });

  it('returns 부회장 for VICE_PRESIDENT', () => {
    expect(getRoleBadge('VICE_PRESIDENT').label).toBe('부회장');
  });

  it('returns 총무 for TREASURER', () => {
    expect(getRoleBadge('TREASURER').label).toBe('총무');
  });

  it('returns 회원 for MEMBER', () => {
    expect(getRoleBadge('MEMBER').label).toBe('회원');
  });

  it('defaults to MEMBER for unknown role', () => {
    expect(getRoleBadge('UNKNOWN').label).toBe('회원');
  });
});

describe('getCategoryLabel', () => {
  it('returns 자유 for FREE', () => {
    expect(getCategoryLabel('FREE')).toBe('자유');
  });

  it('returns 소식 for NEWS', () => {
    expect(getCategoryLabel('NEWS')).toBe('소식');
  });

  it('returns 취업 for JOB', () => {
    expect(getCategoryLabel('JOB')).toBe('취업');
  });

  it('returns 장터 for MARKETPLACE', () => {
    expect(getCategoryLabel('MARKETPLACE')).toBe('장터');
  });

  it('returns raw value for unknown category', () => {
    expect(getCategoryLabel('OTHER')).toBe('OTHER');
  });
});

describe('getInitials', () => {
  it('returns first character', () => {
    expect(getInitials('홍길동')).toBe('홍');
  });

  it('handles single character', () => {
    expect(getInitials('A')).toBe('A');
  });
});
