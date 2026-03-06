import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PostsService', () => {
  let service: PostsService;

  const mockPrisma = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    postLike: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockPost = {
    id: 'post-1',
    title: '테스트 게시글',
    content: '내용입니다',
    authorId: 'user-1',
    category: 'FREE',
    isPinned: false,
    viewCount: 0,
    likeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const dto = { title: '테스트', content: '내용' };
      mockPrisma.post.create.mockResolvedValue({
        ...mockPost,
        ...dto,
        author: { id: 'user-1', name: '홍길동', profileImage: null },
      });

      const result = await service.create('user-1', dto);

      expect(result.title).toBe('테스트');
      expect(mockPrisma.post.create).toHaveBeenCalledWith({
        data: { ...dto, authorId: 'user-1' },
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      mockPrisma.post.findMany.mockResolvedValue([mockPost]);
      mockPrisma.post.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by category', async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20, category: 'NOTICE' as any });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'NOTICE' }),
        }),
      );
    });

    it('should filter by search keyword', async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20, search: '테스트' });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: '테스트', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should use default page and limit', async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result.page).toBe(1);
      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return post with comments and increment view count', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({
        ...mockPost,
        author: { id: 'user-1', name: '홍길동', profileImage: null },
        comments: [],
        _count: { likes: 0 },
      });
      mockPrisma.post.update.mockResolvedValue({});

      const result = await service.findOne('post-1');

      expect(result.title).toBe('테스트 게시글');
      expect(mockPrisma.post.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        data: { viewCount: { increment: 1 } },
      });
    });

    it('should throw NotFoundException for non-existent post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update post by author', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);
      mockPrisma.post.update.mockResolvedValue({
        ...mockPost,
        title: '수정됨',
      });

      const result = await service.update('post-1', 'user-1', Role.MEMBER, {
        title: '수정됨',
      });

      expect(result.title).toBe('수정됨');
    });

    it('should allow PRESIDENT to update any post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);
      mockPrisma.post.update.mockResolvedValue({
        ...mockPost,
        title: '관리자 수정',
      });

      const result = await service.update(
        'post-1',
        'other-user',
        Role.PRESIDENT,
        { title: '관리자 수정' },
      );

      expect(result.title).toBe('관리자 수정');
    });

    it('should throw ForbiddenException for non-author non-admin', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      await expect(
        service.update('post-1', 'other-user', Role.MEMBER, {
          title: '수정',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'user-1', Role.MEMBER, {
          title: '수정',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete post by author', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);
      mockPrisma.post.delete.mockResolvedValue({});

      const result = await service.remove('post-1', 'user-1', Role.MEMBER);

      expect(result.message).toBe('게시글이 삭제되었습니다');
    });

    it('should allow VICE_PRESIDENT to delete any post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);
      mockPrisma.post.delete.mockResolvedValue({});

      const result = await service.remove(
        'post-1',
        'other-user',
        Role.VICE_PRESIDENT,
      );

      expect(result.message).toBe('게시글이 삭제되었습니다');
    });

    it('should throw ForbiddenException for non-author non-admin', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      await expect(
        service.remove('post-1', 'other-user', Role.MEMBER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('toggleLike', () => {
    it('should add like when not already liked', async () => {
      mockPrisma.postLike.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue([]);
      mockPrisma.post.findUnique.mockResolvedValue({ likeCount: 1 });

      const result = await service.toggleLike('post-1', 'user-1');

      expect(result).toEqual({ liked: true, likeCount: 1 });
    });

    it('should remove like when already liked', async () => {
      mockPrisma.postLike.findUnique.mockResolvedValue({
        id: 'like-1',
        postId: 'post-1',
        userId: 'user-1',
      });
      mockPrisma.$transaction.mockResolvedValue([]);
      mockPrisma.post.findUnique.mockResolvedValue({ likeCount: 0 });

      const result = await service.toggleLike('post-1', 'user-1');

      expect(result).toEqual({ liked: false, likeCount: 0 });
    });
  });

  describe('pinPost', () => {
    it('should toggle pin status', async () => {
      mockPrisma.post.findUnique
        .mockResolvedValueOnce(mockPost) // findPostOrThrow
        .mockResolvedValueOnce(mockPost); // get current state
      mockPrisma.post.update.mockResolvedValue({ ...mockPost, isPinned: true });

      const result = await service.pinPost('post-1');

      expect(result.isPinned).toBe(true);
    });

    it('should throw NotFoundException for non-existent post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.pinPost('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
