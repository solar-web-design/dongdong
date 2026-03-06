import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

jest.mock('@/lib/store', () => ({
  useAuthStore: () => ({
    user: { name: '테스트', profileImage: null },
  }),
}));

beforeEach(() => {
  mockPush.mockClear();
});

describe('Header', () => {
  it('renders 동동 logo', () => {
    render(<Header />);
    expect(screen.getByText('동동')).toBeInTheDocument();
  });

  it('logo links to /feed', () => {
    render(<Header />);
    expect(screen.getByText('동동').closest('a')).toHaveAttribute('href', '/feed');
  });

  it('navigates to /members on search click', () => {
    render(<Header />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockPush).toHaveBeenCalledWith('/members');
  });

  it('navigates to /notifications on bell click', () => {
    render(<Header />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(mockPush).toHaveBeenCalledWith('/notifications');
  });

  it('has settings link with avatar', () => {
    render(<Header />);
    const links = screen.getAllByRole('link');
    const settingsLink = links.find(l => l.getAttribute('href') === '/settings');
    expect(settingsLink).toBeInTheDocument();
  });
});
