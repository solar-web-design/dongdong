import { render, screen } from '@testing-library/react';
import Sidebar from '../Sidebar';

const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockUser = jest.fn();
jest.mock('@/lib/store', () => ({
  useAuthStore: () => ({ user: mockUser() }),
}));

beforeEach(() => {
  mockPathname.mockReturnValue('/feed');
  mockUser.mockReturnValue({ role: 'MEMBER', name: '일반회원' });
});

describe('Sidebar', () => {
  it('renders all menu items', () => {
    render(<Sidebar />);
    expect(screen.getByText('피드')).toBeInTheDocument();
    expect(screen.getByText('모임')).toBeInTheDocument();
    expect(screen.getByText('채팅')).toBeInTheDocument();
    expect(screen.getByText('회비')).toBeInTheDocument();
    expect(screen.getByText('동문 찾기')).toBeInTheDocument();
    expect(screen.getByText('공지사항')).toBeInTheDocument();
    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('설정')).toBeInTheDocument();
  });

  it('renders 동동 logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('동동')).toBeInTheDocument();
  });

  it('does not show admin link for MEMBER role', () => {
    render(<Sidebar />);
    expect(screen.queryByText('관리')).not.toBeInTheDocument();
  });

  it('shows admin link for PRESIDENT role', () => {
    mockUser.mockReturnValue({ role: 'PRESIDENT', name: '회장' });
    render(<Sidebar />);
    expect(screen.getByText('관리')).toBeInTheDocument();
  });

  it('shows admin link for VICE_PRESIDENT role', () => {
    mockUser.mockReturnValue({ role: 'VICE_PRESIDENT', name: '부회장' });
    render(<Sidebar />);
    expect(screen.getByText('관리')).toBeInTheDocument();
  });
});
