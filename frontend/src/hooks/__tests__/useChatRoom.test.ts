import { renderHook, act } from '@testing-library/react';

const mockEmit = jest.fn();
const mockOn = jest.fn();

jest.mock('../useSocket', () => ({
  useSocket: () => ({
    emit: mockEmit,
    on: mockOn.mockImplementation(() => jest.fn()),
  }),
}));

import { useChatRoom } from '../useChatRoom';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useChatRoom', () => {
  it('joins room on mount', () => {
    renderHook(() => useChatRoom('room-1'));
    expect(mockEmit).toHaveBeenCalledWith('join_room', 'room-1');
  });

  it('leaves room on unmount', () => {
    const { unmount } = renderHook(() => useChatRoom('room-1'));
    mockEmit.mockClear();
    unmount();
    expect(mockEmit).toHaveBeenCalledWith('leave_room', 'room-1');
  });

  it('listens for new_message and typing events', () => {
    renderHook(() => useChatRoom('room-1'));
    const events = mockOn.mock.calls.map((c: unknown[]) => c[0]);
    expect(events).toContain('new_message');
    expect(events).toContain('typing');
  });

  it('sendMessage emits send_message with content', () => {
    const { result } = renderHook(() => useChatRoom('room-1'));
    act(() => {
      result.current.sendMessage('안녕하세요');
    });
    expect(mockEmit).toHaveBeenCalledWith('send_message', {
      roomId: 'room-1',
      content: '안녕하세요',
      images: undefined,
    });
  });

  it('sendMessage emits with images', () => {
    const { result } = renderHook(() => useChatRoom('room-1'));
    act(() => {
      result.current.sendMessage('사진', ['img1.jpg']);
    });
    expect(mockEmit).toHaveBeenCalledWith('send_message', {
      roomId: 'room-1',
      content: '사진',
      images: ['img1.jpg'],
    });
  });

  it('sendTyping emits typing event', () => {
    const { result } = renderHook(() => useChatRoom('room-1'));
    act(() => {
      result.current.sendTyping();
    });
    expect(mockEmit).toHaveBeenCalledWith('typing', { roomId: 'room-1' });
  });

  it('markRead emits read_messages', () => {
    const { result } = renderHook(() => useChatRoom('room-1'));
    act(() => {
      result.current.markRead();
    });
    expect(mockEmit).toHaveBeenCalledWith('read_messages', { roomId: 'room-1' });
  });

  it('initializes with empty messages', () => {
    const { result } = renderHook(() => useChatRoom('room-1'));
    expect(result.current.messages).toEqual([]);
  });

  it('initializes with empty typingUsers', () => {
    const { result } = renderHook(() => useChatRoom('room-1'));
    expect(result.current.typingUsers).toEqual([]);
  });
});
