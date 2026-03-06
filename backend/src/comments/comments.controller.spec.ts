import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Reflector } from '@nestjs/core';

describe('CommentsController', () => {
  let controller: CommentsController;

  const mockCommentsService = {
    getComments: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        { provide: CommentsService, useValue: mockCommentsService },
        Reflector,
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    jest.clearAllMocks();
  });

  describe('getComments', () => {
    it('should return comments for a post', async () => {
      const expected = { data: [{ id: 'c1', content: '댓글' }] };
      mockCommentsService.getComments.mockResolvedValue(expected);

      const result = await controller.getComments('post-1');

      expect(result).toEqual(expected);
      expect(mockCommentsService.getComments).toHaveBeenCalledWith('post-1');
    });
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const comment = { id: 'c1', content: '댓글', postId: 'post-1' };
      mockCommentsService.create.mockResolvedValue(comment);

      const result = await controller.create('post-1', 'user-1', {
        content: '댓글',
      });

      expect(result).toEqual(comment);
      expect(mockCommentsService.create).toHaveBeenCalledWith(
        'post-1',
        'user-1',
        { content: '댓글' },
      );
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      mockCommentsService.update.mockResolvedValue({
        id: 'c1',
        content: '수정됨',
      });

      const result = await controller.update('c1', 'user-1', Role.MEMBER, {
        content: '수정됨',
      });

      expect(result.content).toBe('수정됨');
      expect(mockCommentsService.update).toHaveBeenCalledWith(
        'c1',
        'user-1',
        Role.MEMBER,
        { content: '수정됨' },
      );
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      mockCommentsService.remove.mockResolvedValue({
        message: '댓글이 삭제되었습니다',
      });

      const result = await controller.remove('c1', 'user-1', Role.MEMBER);

      expect(result.message).toBe('댓글이 삭제되었습니다');
    });
  });
});
