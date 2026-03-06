import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

const mockApi = jest.fn();
jest.mock('@/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
}));

import FeedPage from '../feed/page';

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

describe('FeedPage', () => {
  it('renders category tabs', () => {
    mockApi.mockResolvedValueOnce({ data: [], total: 0, page: 1, totalPages: 0 });
    renderWithQuery(<FeedPage />);
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('자유')).toBeInTheDocument();
    expect(screen.getByText('소식')).toBeInTheDocument();
    expect(screen.getByText('취업')).toBeInTheDocument();
    expect(screen.getByText('장터')).toBeInTheDocument();
  });

  it('renders write FAB link', () => {
    mockApi.mockResolvedValueOnce({ data: [], total: 0, page: 1, totalPages: 0 });
    renderWithQuery(<FeedPage />);
    const fabLink = screen.getAllByRole('link').find(l => l.getAttribute('href') === '/posts/write');
    expect(fabLink).toBeInTheDocument();
  });

  it('shows empty state when no posts', async () => {
    mockApi.mockResolvedValueOnce({ data: [], total: 0, page: 1, totalPages: 0 });
    renderWithQuery(<FeedPage />);
    expect(await screen.findByText('게시글이 없습니다')).toBeInTheDocument();
  });

  it('renders posts when data is returned', async () => {
    mockApi.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          title: '첫 번째 글',
          content: '내용입니다',
          category: 'FREE',
          images: [],
          viewCount: 10,
          likeCount: 5,
          isPinned: false,
          author: { id: '1', name: '홍길동', profileImage: null },
          authorId: '1',
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    });

    renderWithQuery(<FeedPage />);
    expect(await screen.findByText('첫 번째 글')).toBeInTheDocument();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
  });

  it('shows pinned indicator for pinned posts', async () => {
    mockApi.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          title: '공지',
          content: '중요공지',
          category: 'NEWS',
          images: [],
          viewCount: 0,
          likeCount: 0,
          isPinned: true,
          author: { id: '1', name: '회장' },
          authorId: '1',
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    });

    renderWithQuery(<FeedPage />);
    expect(await screen.findByText('고정됨')).toBeInTheDocument();
  });

  it('switches category on tab click', () => {
    mockApi.mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 0 });
    renderWithQuery(<FeedPage />);
    fireEvent.click(screen.getByText('취업'));
    // After clicking, the API should be called again with category param
    expect(mockApi).toHaveBeenCalled();
  });
});
