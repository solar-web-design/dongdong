import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockLogin = jest.fn();
jest.mock('@/lib/store', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isAuthenticated: false,
  }),
}));

const mockApi = jest.fn();
jest.mock('@/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
}));

import LoginPage from '../login/page';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('renders social login buttons', () => {
    render(<LoginPage />);
    expect(screen.getByText('카카오 로그인')).toBeInTheDocument();
    expect(screen.getByText('Google 로그인')).toBeInTheDocument();
  });

  it('renders register link', () => {
    render(<LoginPage />);
    expect(screen.getByText('회원가입')).toBeInTheDocument();
    expect(screen.getByText('회원가입').closest('a')).toHaveAttribute('href', '/register');
  });

  it('submits form and calls login on success', async () => {
    mockApi.mockResolvedValueOnce({
      user: { id: '1', name: '테스트' },
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByPlaceholderText('이메일').closest('form')!);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { id: '1', name: '테스트' },
      );
      expect(mockPush).toHaveBeenCalledWith('/feed');
    });
  });

  it('displays error on login failure', async () => {
    mockApi.mockRejectedValueOnce(new Error('잘못된 인증 정보'));

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByPlaceholderText('이메일').closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('잘못된 인증 정보')).toBeInTheDocument();
    });
  });

  it('shows loading state during submit', async () => {
    mockApi.mockImplementation(() => new Promise(() => {}));

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByPlaceholderText('이메일').closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로그인 중...' })).toBeInTheDocument();
    });
  });
});
