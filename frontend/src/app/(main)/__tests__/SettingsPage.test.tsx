import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

const mockLogout = jest.fn();
const mockSetUser = jest.fn();
jest.mock('@/lib/store', () => ({
  useAuthStore: () => ({
    user: {
      id: '1',
      name: '홍길동',
      email: 'hong@test.com',
      phone: '010-1234-5678',
      bio: '안녕하세요',
      company: '테스트사',
      position: '개발자',
      location: '서울',
      website: 'https://test.com',
      profileImage: null,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
    setUser: mockSetUser,
    logout: mockLogout,
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useThemeStore: () => ({
    theme: 'system',
    setTheme: jest.fn(),
  }),
}));

jest.mock('@/lib/api', () => ({
  api: jest.fn().mockResolvedValue({}),
  apiUpload: jest.fn().mockResolvedValue({ url: 'https://img.com/new.jpg' }),
}));

import SettingsPage from '../settings/page';

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SettingsPage', () => {
  it('renders settings title', () => {
    renderWithQuery(<SettingsPage />);
    expect(screen.getByText('설정')).toBeInTheDocument();
  });

  it('renders form fields with user data', () => {
    renderWithQuery(<SettingsPage />);
    expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument();
    expect(screen.getByDisplayValue('010-1234-5678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('안녕하세요')).toBeInTheDocument();
    expect(screen.getByDisplayValue('테스트사')).toBeInTheDocument();
    expect(screen.getByDisplayValue('개발자')).toBeInTheDocument();
    expect(screen.getByDisplayValue('서울')).toBeInTheDocument();
  });

  it('renders theme buttons', () => {
    renderWithQuery(<SettingsPage />);
    expect(screen.getByText('라이트')).toBeInTheDocument();
    expect(screen.getByText('다크')).toBeInTheDocument();
    expect(screen.getByText('시스템')).toBeInTheDocument();
  });

  it('renders save and logout buttons', () => {
    renderWithQuery(<SettingsPage />);
    expect(screen.getByText('저장')).toBeInTheDocument();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  it('calls router.back on back button click', () => {
    renderWithQuery(<SettingsPage />);
    const buttons = screen.getAllByRole('button');
    // First button is the back arrow
    fireEvent.click(buttons[0]);
    expect(mockBack).toHaveBeenCalled();
  });

  it('updates form field on change', () => {
    renderWithQuery(<SettingsPage />);
    const nameInput = screen.getByDisplayValue('홍길동');
    fireEvent.change(nameInput, { target: { value: '김철수' } });
    expect(screen.getByDisplayValue('김철수')).toBeInTheDocument();
  });
});
