import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockApi = jest.fn();
jest.mock('@/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
}));

import NotificationsPage from '../notifications/page';

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

describe('NotificationsPage', () => {
  it('renders page title', () => {
    mockApi.mockResolvedValueOnce({ data: [], unreadCount: 0 });
    renderWithQuery(<NotificationsPage />);
    expect(screen.getByText('알림')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', async () => {
    mockApi.mockResolvedValueOnce({ data: [], unreadCount: 0 });
    renderWithQuery(<NotificationsPage />);
    expect(await screen.findByText('알림이 없습니다')).toBeInTheDocument();
  });

  it('renders notification list', async () => {
    mockApi.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          type: 'POST',
          title: '새 글',
          message: '새 게시글이 등록되었습니다',
          isRead: false,
          link: '/posts/1',
          userId: '1',
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
    });

    renderWithQuery(<NotificationsPage />);
    expect(await screen.findByText('새 게시글이 등록되었습니다')).toBeInTheDocument();
  });

  it('shows 전체 읽음 button when unread exists', async () => {
    mockApi.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          type: 'POST',
          title: '글',
          message: '알림 메시지',
          isRead: false,
          userId: '1',
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
    });

    renderWithQuery(<NotificationsPage />);
    expect(await screen.findByText('전체 읽음')).toBeInTheDocument();
  });

  it('does not show 전체 읽음 button when all read', async () => {
    mockApi.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          type: 'POST',
          title: '글',
          message: '읽은 알림',
          isRead: true,
          userId: '1',
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 0,
    });

    renderWithQuery(<NotificationsPage />);
    await screen.findByText('읽은 알림');
    expect(screen.queryByText('전체 읽음')).not.toBeInTheDocument();
  });

  it('navigates to link on notification click', async () => {
    mockApi
      .mockResolvedValueOnce({
        data: [
          {
            id: '1',
            type: 'POST',
            title: '글',
            message: '클릭 알림',
            isRead: true,
            link: '/posts/123',
            userId: '1',
            createdAt: new Date().toISOString(),
          },
        ],
        unreadCount: 0,
      });

    renderWithQuery(<NotificationsPage />);
    const notification = await screen.findByText('클릭 알림');
    fireEvent.click(notification.closest('button')!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/posts/123');
    });
  });
});
