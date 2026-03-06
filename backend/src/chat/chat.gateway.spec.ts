import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;

  const mockJwtService = { verify: jest.fn() };
  const mockConfigService = { get: jest.fn().mockReturnValue('test-secret') };
  const mockChatService = {
    sendMessage: jest.fn(),
    markAsRead: jest.fn(),
  };

  const createMockSocket = (overrides: any = {}): Socket =>
    ({
      id: 'socket-1',
      data: {},
      handshake: {
        auth: { token: 'valid-token' },
        headers: {},
      },
      disconnect: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      ...overrides,
    }) as any;

  beforeEach(() => {
    gateway = new ChatGateway(
      mockJwtService as any,
      mockConfigService as any,
      mockChatService as any,
    );
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue('test-secret');
  });

  describe('handleConnection', () => {
    it('should authenticate and store socket', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      const client = createMockSocket();

      await gateway.handleConnection(client);

      expect(client.data.userId).toBe('user-1');
    });

    it('should disconnect if no token', async () => {
      const client = createMockSocket({
        handshake: { auth: {}, headers: {} },
      });

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should disconnect on invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });
      const client = createMockSocket();

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should use authorization header as fallback', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      const client = createMockSocket({
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-token' },
        },
      });

      await gateway.handleConnection(client);

      expect(mockJwtService.verify).toHaveBeenCalledWith('header-token', {
        secret: 'test-secret',
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should remove socket from user map', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      const client = createMockSocket();
      await gateway.handleConnection(client);

      gateway.handleDisconnect(client);

      // Verify no error on second disconnect
      gateway.handleDisconnect(client);
    });

    it('should handle disconnect without userId', () => {
      const client = createMockSocket();
      // No userId set
      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  describe('handleJoinRoom', () => {
    it('should join socket to room', () => {
      const client = createMockSocket();

      gateway.handleJoinRoom(client, 'room-1');

      expect(client.join).toHaveBeenCalledWith('room-1');
    });
  });

  describe('handleLeaveRoom', () => {
    it('should leave socket from room', () => {
      const client = createMockSocket();

      gateway.handleLeaveRoom(client, 'room-1');

      expect(client.leave).toHaveBeenCalledWith('room-1');
    });
  });

  describe('handleSendMessage', () => {
    it('should send message and emit to room', async () => {
      const client = createMockSocket();
      client.data.userId = 'user-1';
      const mockMessage = { id: 'msg-1', content: '안녕' };
      mockChatService.sendMessage.mockResolvedValue(mockMessage);

      await gateway.handleSendMessage(client, {
        roomId: 'room-1',
        content: '안녕',
      });

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'room-1',
        'user-1',
        '안녕',
        undefined,
      );
      expect(gateway.server.to).toHaveBeenCalledWith('room-1');
    });

    it('should do nothing if userId not set', async () => {
      const client = createMockSocket();

      await gateway.handleSendMessage(client, {
        roomId: 'room-1',
        content: '안녕',
      });

      expect(mockChatService.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('handleTyping', () => {
    it('should emit typing event to room', () => {
      const client = createMockSocket();
      client.data.userId = 'user-1';

      gateway.handleTyping(client, { roomId: 'room-1' });

      expect(client.to).toHaveBeenCalledWith('room-1');
    });

    it('should do nothing if userId not set', () => {
      const client = createMockSocket();

      gateway.handleTyping(client, { roomId: 'room-1' });

      expect(client.to).not.toHaveBeenCalled();
    });
  });

  describe('handleReadMessages', () => {
    it('should mark messages as read', async () => {
      const client = createMockSocket();
      client.data.userId = 'user-1';

      await gateway.handleReadMessages(client, { roomId: 'room-1' });

      expect(mockChatService.markAsRead).toHaveBeenCalledWith(
        'room-1',
        'user-1',
      );
    });

    it('should do nothing if userId not set', async () => {
      const client = createMockSocket();

      await gateway.handleReadMessages(client, { roomId: 'room-1' });

      expect(mockChatService.markAsRead).not.toHaveBeenCalled();
    });
  });
});
