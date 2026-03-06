jest.mock('socket.io-client', () => {
  const mockSocket = {
    connected: false,
    auth: {},
    connect: jest.fn(function (this: { connected: boolean }) {
      this.connected = true;
    }),
    disconnect: jest.fn(function (this: { connected: boolean }) {
      this.connected = false;
    }),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };
  return {
    io: jest.fn(() => mockSocket),
    __mockSocket: mockSocket,
  };
});

import { getSocket, connectSocket, disconnectSocket } from '../socket';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { __mockSocket } = require('socket.io-client');

beforeEach(() => {
  __mockSocket.connected = false;
  __mockSocket.connect.mockClear();
  __mockSocket.disconnect.mockClear();
  localStorage.clear();
  // Reset socket module's internal state
  disconnectSocket();
});

describe('getSocket', () => {
  it('creates and returns a socket', () => {
    const socket = getSocket();
    expect(socket).toBeDefined();
  });

  it('returns same socket on multiple calls', () => {
    const s1 = getSocket();
    const s2 = getSocket();
    expect(s1).toBe(s2);
  });
});

describe('connectSocket', () => {
  it('connects the socket', () => {
    const socket = connectSocket();
    expect(socket.connect).toHaveBeenCalled();
  });

  it('does not reconnect if already connected', () => {
    const socket = connectSocket();
    __mockSocket.connect.mockClear();
    connectSocket();
    expect(__mockSocket.connect).not.toHaveBeenCalled();
  });
});

describe('disconnectSocket', () => {
  it('disconnects connected socket', () => {
    connectSocket();
    disconnectSocket();
    expect(__mockSocket.disconnect).toHaveBeenCalled();
  });

  it('handles already disconnected socket', () => {
    disconnectSocket();
    // Should not throw
  });
});
