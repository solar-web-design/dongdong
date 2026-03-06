import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatService', () => {
  let service: ChatService;

  const mockPrisma = {
    chatRoomMember: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    chatRoom: {
      create: jest.fn(),
      update: jest.fn(),
    },
    chatMessage: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  describe('getRooms', () => {
    it('should return chat rooms for user', async () => {
      const now = new Date();
      mockPrisma.chatRoomMember.findMany.mockResolvedValue([
        {
          chatRoom: {
            id: 'room-1',
            name: '동문방',
            type: 'GROUP',
            members: [],
            messages: [{ id: 'msg-1', content: '안녕', createdAt: now }],
            updatedAt: now,
          },
        },
      ]);

      const result = await service.getRooms('user-1');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].lastMessage.content).toBe('안녕');
      expect(result.data[0].messages).toBeUndefined();
    });

    it('should handle room with no messages', async () => {
      mockPrisma.chatRoomMember.findMany.mockResolvedValue([
        {
          chatRoom: {
            id: 'room-1',
            name: '빈 방',
            type: 'GROUP',
            members: [],
            messages: [],
            updatedAt: new Date(),
          },
        },
      ]);

      const result = await service.getRooms('user-1');

      expect(result.data[0].lastMessage).toBeNull();
    });
  });

  describe('createRoom', () => {
    it('should create a chat room with unique members', async () => {
      const mockRoom = {
        id: 'room-1',
        name: '동문방',
        type: 'GROUP',
        members: [
          { user: { id: 'user-1', name: '홍길동', profileImage: null } },
          { user: { id: 'user-2', name: '이영희', profileImage: null } },
        ],
      };
      mockPrisma.chatRoom.create.mockResolvedValue(mockRoom);

      const result = await service.createRoom('user-1', {
        name: '동문방',
        type: 'GROUP' as any,
        memberIds: ['user-2'],
      });

      expect(result.members).toHaveLength(2);
      // Verify creator is included in members
      expect(mockPrisma.chatRoom.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            members: {
              create: expect.arrayContaining([
                { userId: 'user-1' },
                { userId: 'user-2' },
              ]),
            },
          }),
        }),
      );
    });

    it('should deduplicate member IDs', async () => {
      mockPrisma.chatRoom.create.mockResolvedValue({ id: 'room-1', members: [] });

      await service.createRoom('user-1', {
        name: 'test',
        type: 'DM' as any,
        memberIds: ['user-1', 'user-2'],
      });

      // user-1 should appear only once
      const createCall = mockPrisma.chatRoom.create.mock.calls[0][0];
      const memberCreates = createCall.data.members.create;
      const userIds = memberCreates.map((m: any) => m.userId);
      expect(new Set(userIds).size).toBe(userIds.length);
    });
  });

  describe('getMessages', () => {
    it('should return messages with cursor pagination', async () => {
      mockPrisma.chatRoomMember.findUnique.mockResolvedValue({
        chatRoomId: 'room-1',
        userId: 'user-1',
      });
      const messages = Array.from({ length: 3 }, (_, i) => ({
        id: `msg-${i}`,
        content: `message ${i}`,
        createdAt: new Date(),
      }));
      mockPrisma.chatMessage.findMany.mockResolvedValue(messages);

      const result = await service.getMessages('room-1', 'user-1', {
        limit: 50,
      });

      expect(result.data).toHaveLength(3);
      expect(result.nextCursor).toBeNull();
    });

    it('should return nextCursor when there are more messages', async () => {
      mockPrisma.chatRoomMember.findUnique.mockResolvedValue({
        chatRoomId: 'room-1',
        userId: 'user-1',
      });
      const messages = Array.from({ length: 3 }, (_, i) => ({
        id: `msg-${i}`,
        content: `message ${i}`,
        createdAt: new Date('2025-01-01'),
      }));
      mockPrisma.chatMessage.findMany.mockResolvedValue(messages);

      const result = await service.getMessages('room-1', 'user-1', {
        limit: 2,
      });

      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBeTruthy();
    });

    it('should throw ForbiddenException for non-member', async () => {
      mockPrisma.chatRoomMember.findUnique.mockResolvedValue(null);

      await expect(
        service.getMessages('room-1', 'user-1', { limit: 50 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('sendMessage', () => {
    it('should send a message and update room', async () => {
      mockPrisma.chatRoomMember.findUnique.mockResolvedValue({
        chatRoomId: 'room-1',
        userId: 'user-1',
      });
      const mockMessage = {
        id: 'msg-1',
        chatRoomId: 'room-1',
        senderId: 'user-1',
        content: '안녕하세요',
        images: [],
      };
      mockPrisma.chatMessage.create.mockResolvedValue(mockMessage);
      mockPrisma.chatRoom.update.mockResolvedValue({});

      const result = await service.sendMessage('room-1', 'user-1', '안녕하세요');

      expect(result.content).toBe('안녕하세요');
      expect(mockPrisma.chatRoom.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { updatedAt: expect.any(Date) },
      });
    });

    it('should throw ForbiddenException for non-member', async () => {
      mockPrisma.chatRoomMember.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage('room-1', 'user-1', '안녕'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAsRead', () => {
    it('should update lastReadAt', async () => {
      mockPrisma.chatRoomMember.update.mockResolvedValue({});

      await service.markAsRead('room-1', 'user-1');

      expect(mockPrisma.chatRoomMember.update).toHaveBeenCalledWith({
        where: { chatRoomId_userId: { chatRoomId: 'room-1', userId: 'user-1' } },
        data: { lastReadAt: expect.any(Date) },
      });
    });
  });
});
