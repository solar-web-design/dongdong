import { render, screen } from '@testing-library/react';
import BottomNav from '../BottomNav';

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

beforeEach(() => {
  mockPathname.mockReturnValue('/feed');
});

describe('BottomNav', () => {
  it('renders all 5 nav items', () => {
    render(<BottomNav />);
    expect(screen.getByText('피드')).toBeInTheDocument();
    expect(screen.getByText('모임')).toBeInTheDocument();
    expect(screen.getByText('채팅')).toBeInTheDocument();
    expect(screen.getByText('회비')).toBeInTheDocument();
    expect(screen.getByText('더보기')).toBeInTheDocument();
  });

  it('renders correct hrefs', () => {
    render(<BottomNav />);
    expect(screen.getByText('피드').closest('a')).toHaveAttribute('href', '/feed');
    expect(screen.getByText('모임').closest('a')).toHaveAttribute('href', '/meetings');
    expect(screen.getByText('채팅').closest('a')).toHaveAttribute('href', '/chat');
  });

  it('highlights active item based on pathname', () => {
    mockPathname.mockReturnValue('/meetings/123');
    render(<BottomNav />);
    const meetingLink = screen.getByText('모임').closest('a');
    expect(meetingLink).toHaveClass('text-gray-900');
  });
});
