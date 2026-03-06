import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockPrisma = {
    post: { findUnique: jest.fn() },
    comment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockComment = {
    id: 'comment-1',
    content: '댓글 내용',
    postId: 'post-1',
    authorId: 'user-1',
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();
  });

  describe('getComments', () => {
    it('should return comments for a post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      mockPrisma.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.getComments('post-1');

      expect(result.data).toHaveLength(1);
      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { postId: 'post-1', parentId: null },
        }),
      );
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.getComments('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a comment', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      mockPrisma.comment.create.mockResolvedValue({
        ...mockComment,
        author: { id: 'user-1', name: '홍길동', profileImage: null },
      });

      const result = await service.create('post-1', 'user-1', {
        content: '댓글 내용',
      });

      expect(result.content).toBe('댓글 내용');
    });

    it('should create a reply to existing comment', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockComment,
        id: 'parent-1',
      });
      mockPrisma.comment.create.mockResolvedValue({
        ...mockComment,
        parentId: 'parent-1',
        author: { id: 'user-1', name: '홍길동', profileImage: null },
      });

      const result = await service.create('post-1', 'user-1', {
        content: '대댓글',
        parentId: 'parent-1',
      });

      expect(result.parentId).toBe('parent-1');
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.create('non-existent', 'user-1', { content: '댓글' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if parent comment not found', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      mockPrisma.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.create('post-1', 'user-1', {
          content: '대댓글',
          parentId: 'non-existent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if parent comment belongs to different post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockComment,
        postId: 'other-post',
      });

      await expect(
        service.create('post-1', 'user-1', {
          content: '대댓글',
          parentId: 'comment-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update comment by author', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
      mockPrisma.comment.update.mockResolvedValue({
        ...mockComment,
        content: '수정됨',
      });

      const result = await service.update('comment-1', 'user-1', Role.MEMBER, {
        content: '수정됨',
      });

      expect(result.content).toBe('수정됨');
    });

    it('should allow PRESIDENT to update any comment', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
      mockPrisma.comment.update.mockResolvedValue({
        ...mockComment,
        content: '관리자 수정',
      });

      const result = await service.update(
        'comment-1',
        'other-user',
        Role.PRESIDENT,
        { content: '관리자 수정' },
      );

      expect(result.content).toBe('관리자 수정');
    });

    it('should throw ForbiddenException for non-author non-admin', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.update('comment-1', 'other-user', Role.MEMBER, {
          content: '수정',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent comment', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'user-1', Role.MEMBER, {
          content: '수정',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete comment by author', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
      mockPrisma.comment.delete.mockResolvedValue({});

      const result = await service.remove('comment-1', 'user-1', Role.MEMBER);

      expect(result.message).toBe('댓글이 삭제되었습니다');
    });

    it('should allow VICE_PRESIDENT to delete any comment', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
      mockPrisma.comment.delete.mockResolvedValue({});

      const result = await service.remove(
        'comment-1',
        'other-user',
        Role.VICE_PRESIDENT,
      );

      expect(result.message).toBe('댓글이 삭제되었습니다');
    });

    it('should throw ForbiddenException for non-author MEMBER', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.remove('comment-1', 'other-user', Role.MEMBER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent comment', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('non-existent', 'user-1', Role.MEMBER),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
