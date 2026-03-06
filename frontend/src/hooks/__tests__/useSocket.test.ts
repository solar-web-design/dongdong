import { renderHook } from '@testing-library/react';

const mockSocket = {
  connected: false,
  auth: {},
  connect: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

jest.mock('@/lib/socket', () => ({
  connectSocket: jest.fn(() => mockSocket),
  disconnectSocket: jest.fn(),
  getSocket: jest.fn(() => mockSocket),
}));

import { useSocket } from '../useSocket';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSocket', () => {
  it('connects on mount', () => {
    const { unmount } = renderHook(() => useSocket());
    const { connectSocket } = require('@/lib/socket');
    expect(connectSocket).toHaveBeenCalled();
    unmount();
  });

  it('disconnects on unmount', () => {
    const { unmount } = renderHook(() => useSocket());
    unmount();
    const { disconnectSocket } = require('@/lib/socket');
    expect(disconnectSocket).toHaveBeenCalled();
  });

  it('returns emit function', () => {
    const { result } = renderHook(() => useSocket());
    expect(typeof result.current.emit).toBe('function');
  });

  it('returns on function', () => {
    const { result } = renderHook(() => useSocket());
    expect(typeof result.current.on).toBe('function');
  });

  it('emit calls socket.emit', () => {
    const { result } = renderHook(() => useSocket());
    // Set ref manually since connectSocket returns mockSocket
    result.current.socket.current = mockSocket as never;
    result.current.emit('test_event', { data: 'hello' });
    expect(mockSocket.emit).toHaveBeenCalledWith('test_event', { data: 'hello' });
  });

  it('on registers and returns cleanup', () => {
    const { result } = renderHook(() => useSocket());
    const handler = jest.fn();
    const cleanup = result.current.on('test_event', handler);
    expect(mockSocket.on).toHaveBeenCalledWith('test_event', handler);
    expect(typeof cleanup).toBe('function');
    cleanup();
    expect(mockSocket.off).toHaveBeenCalledWith('test_event', handler);
  });
});
