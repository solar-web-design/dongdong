import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DmService } from './dm.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DmService', () => {
  let service: DmService;

  const mockPrisma = {
    directMessage: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DmService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DmService>(DmService);
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should return conversations sorted by last message', async () => {
      mockPrisma.directMessage.findMany
        .mockResolvedValueOnce([{ receiverId: 'user-2' }])
        .mockResolvedValueOnce([{ senderId: 'user-3' }]);

      const now = new Date();
      const earlier = new Date(now.getTime() - 1000);

      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: 'user-2', name: '이영희', profileImage: null })
        .mockResolvedValueOnce({ id: 'user-3', name: '박철수', profileImage: null });
      mockPrisma.directMessage.findFirst
        .mockResolvedValueOnce({ content: '안녕', createdAt: earlier })
        .mockResolvedValueOnce({ content: '최신', createdAt: now });
      mockPrisma.directMessage.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(2);

      const result = await service.getConversations('user-1');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].user.name).toBe('박철수');
    });

    it('should return empty list when no conversations', async () => {
      mockPrisma.directMessage.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getConversations('user-1');

      expect(result.data).toHaveLength(0);
    });
  });

  describe('getMessages', () => {
    it('should return messages with cursor pagination', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2' });
      const messages = [
        { id: 'dm-1', content: '안녕', createdAt: new Date() },
        { id: 'dm-2', content: '잘 지내?', createdAt: new Date() },
      ];
      mockPrisma.directMessage.findMany.mockResolvedValue(messages);

      const result = await service.getMessages('user-1', 'user-2', { limit: 50 });

      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it('should return nextCursor when more messages exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2' });
      const messages = Array.from({ length: 3 }, (_, i) => ({
        id: `dm-${i}`,
        content: `msg-${i}`,
        createdAt: new Date('2025-01-01'),
      }));
      mockPrisma.directMessage.findMany.mockResolvedValue(messages);

      const result = await service.getMessages('user-1', 'user-2', { limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBeTruthy();
    });

    it('should throw NotFoundException if partner does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.getMessages('user-1', 'non-existent', { limit: 50 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendMessage', () => {
    it('should create a direct message', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2' });
      mockPrisma.directMessage.create.mockResolvedValue({
        id: 'dm-1',
        content: '안녕',
        senderId: 'user-1',
        receiverId: 'user-2',
      });

      const result = await service.sendMessage('user-1', 'user-2', { content: '안녕' });

      expect(result.content).toBe('안녕');
    });

    it('should throw NotFoundException if receiver does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage('user-1', 'non-existent', { content: '안녕' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      mockPrisma.directMessage.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAsRead('user-1', 'user-2');

      expect(result.message).toBe('읽음 처리되었습니다');
      expect(mockPrisma.directMessage.updateMany).toHaveBeenCalledWith({
        where: { senderId: 'user-2', receiverId: 'user-1', isRead: false },
        data: { isRead: true },
      });
    });
  });
});
