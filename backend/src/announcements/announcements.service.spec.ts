import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;

  const mockPrisma = {
    announcement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockAnnouncement = {
    id: 'ann-1',
    title: '공지사항',
    content: '내용입니다',
    authorId: 'user-1',
    isPinned: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated announcements', async () => {
      mockPrisma.announcement.findMany.mockResolvedValue([mockAnnouncement]);
      mockPrisma.announcement.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should use default page and limit', async () => {
      mockPrisma.announcement.findMany.mockResolvedValue([]);
      mockPrisma.announcement.count.mockResolvedValue(0);

      await service.findAll({});

      expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('create', () => {
    it('should create an announcement', async () => {
      const dto = { title: '새 공지', content: '내용', isPinned: true };
      mockPrisma.announcement.create.mockResolvedValue({
        ...mockAnnouncement,
        ...dto,
      });

      const result = await service.create('user-1', dto);

      expect(result.title).toBe('새 공지');
      expect(mockPrisma.announcement.create).toHaveBeenCalledWith({
        data: { ...dto, authorId: 'user-1' },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update announcement by author', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);
      mockPrisma.announcement.update.mockResolvedValue({
        ...mockAnnouncement,
        title: '수정됨',
      });

      const result = await service.update('ann-1', 'user-1', Role.MEMBER, {
        title: '수정됨',
      });

      expect(result.title).toBe('수정됨');
    });

    it('should allow PRESIDENT to update any announcement', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);
      mockPrisma.announcement.update.mockResolvedValue({
        ...mockAnnouncement,
        title: '관리자 수정',
      });

      const result = await service.update(
        'ann-1',
        'other-user',
        Role.PRESIDENT,
        { title: '관리자 수정' },
      );

      expect(result.title).toBe('관리자 수정');
    });

    it('should throw ForbiddenException for non-author non-admin', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);

      await expect(
        service.update('ann-1', 'other-user', Role.MEMBER, { title: '수정' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent announcement', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'user-1', Role.MEMBER, {
          title: '수정',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete announcement by author', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);
      mockPrisma.announcement.delete.mockResolvedValue({});

      const result = await service.remove('ann-1', 'user-1', Role.MEMBER);

      expect(result.message).toBe('공지가 삭제되었습니다');
    });

    it('should allow VICE_PRESIDENT to delete any announcement', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);
      mockPrisma.announcement.delete.mockResolvedValue({});

      const result = await service.remove(
        'ann-1',
        'other-user',
        Role.VICE_PRESIDENT,
      );

      expect(result.message).toBe('공지가 삭제되었습니다');
    });

    it('should throw ForbiddenException for non-author MEMBER', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(mockAnnouncement);

      await expect(
        service.remove('ann-1', 'other-user', Role.MEMBER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent announcement', async () => {
      mockPrisma.announcement.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('non-existent', 'user-1', Role.MEMBER),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
