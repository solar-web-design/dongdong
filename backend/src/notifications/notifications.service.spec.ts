import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockPrisma = {
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    type: 'POST_COMMENT',
    title: '새 댓글',
    message: '홍길동님이 댓글을 남겼습니다',
    isRead: false,
    link: '/posts/1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return notifications with unread count', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([mockNotification]);
      mockPrisma.notification.count.mockResolvedValue(3);

      const result = await service.findAll('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.unreadCount).toBe(3);
    });

    it('should filter unread only', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      await service.findAll('user-1', { page: 1, limit: 20, unreadOnly: true });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1', isRead: false }),
        }),
      );
    });

    it('should use default page and limit', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      await service.findAll('user-1', {});

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);
      mockPrisma.notification.update.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(
        service.markAsRead('non-existent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if notification belongs to another user', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        ...mockNotification,
        userId: 'other-user',
      });

      await expect(
        service.markAsRead('notif-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead('user-1');

      expect(result.message).toBe('전체 읽음 처리되었습니다');
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe('create', () => {
    it('should create a notification', async () => {
      mockPrisma.notification.create.mockResolvedValue(mockNotification);

      const result = await service.create(
        'user-1',
        'POST_COMMENT' as any,
        '새 댓글',
        '홍길동님이 댓글을 남겼습니다',
        '/posts/1',
      );

      expect(result.type).toBe('POST_COMMENT');
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'POST_COMMENT',
          title: '새 댓글',
          message: '홍길동님이 댓글을 남겼습니다',
          link: '/posts/1',
        },
      });
    });
  });
});
