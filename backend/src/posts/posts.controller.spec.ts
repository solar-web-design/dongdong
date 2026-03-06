import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Reflector } from '@nestjs/core';

describe('PostsController', () => {
  let controller: PostsController;

  const mockPostsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleLike: jest.fn(),
    pinPost: jest.fn(),
  };

  const mockPost = {
    id: 'post-1',
    title: '테스트',
    content: '내용',
    authorId: 'user-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: PostsService, useValue: mockPostsService },
        Reflector,
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const expected = { data: [mockPost], total: 1, page: 1, totalPages: 1 };
      mockPostsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll({ page: 1, limit: 20 });

      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a single post', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne('post-1');

      expect(result).toEqual(mockPost);
    });
  });

  describe('create', () => {
    it('should create a post', async () => {
      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await controller.create('user-1', {
        title: '테스트',
        content: '내용',
      });

      expect(result).toEqual(mockPost);
      expect(mockPostsService.create).toHaveBeenCalledWith('user-1', {
        title: '테스트',
        content: '내용',
      });
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      mockPostsService.update.mockResolvedValue({
        ...mockPost,
        title: '수정됨',
      });

      const result = await controller.update(
        'post-1',
        'user-1',
        Role.MEMBER,
        { title: '수정됨' },
      );

      expect(result.title).toBe('수정됨');
      expect(mockPostsService.update).toHaveBeenCalledWith(
        'post-1',
        'user-1',
        Role.MEMBER,
        { title: '수정됨' },
      );
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      mockPostsService.remove.mockResolvedValue({
        message: '게시글이 삭제되었습니다',
      });

      const result = await controller.remove('post-1', 'user-1', Role.MEMBER);

      expect(result.message).toBe('게시글이 삭제되었습니다');
    });
  });

  describe('toggleLike', () => {
    it('should toggle like', async () => {
      mockPostsService.toggleLike.mockResolvedValue({
        liked: true,
        likeCount: 1,
      });

      const result = await controller.toggleLike('post-1', 'user-1');

      expect(result).toEqual({ liked: true, likeCount: 1 });
    });
  });

  describe('pinPost', () => {
    it('should pin a post', async () => {
      mockPostsService.pinPost.mockResolvedValue({
        ...mockPost,
        isPinned: true,
      });

      const result = await controller.pinPost('post-1');

      expect(result.isPinned).toBe(true);
    });
  });
});
