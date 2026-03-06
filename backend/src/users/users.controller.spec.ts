import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Reflector } from '@nestjs/core';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    getMe: jest.fn(),
    updateProfile: jest.fn(),
    getUserById: jest.fn(),
    getUsers: jest.fn(),
    getPendingUsers: jest.fn(),
    approveUser: jest.fn(),
    rejectUser: jest.fn(),
    changeRole: jest.fn(),
    removeUser: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: '홍길동',
    role: 'MEMBER',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        Reflector,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      mockUsersService.getMe.mockResolvedValue(mockUser);

      const result = await controller.getMe('user-1');

      expect(result).toEqual(mockUser);
      expect(usersService.getMe).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should update and return user profile', async () => {
      const dto = { name: '김철수' };
      mockUsersService.updateProfile.mockResolvedValue({
        ...mockUser,
        name: '김철수',
      });

      const result = await controller.updateProfile('user-1', dto);

      expect(result.name).toBe('김철수');
      expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      mockUsersService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById('user-1');

      expect(result).toEqual(mockUser);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const expected = {
        data: [mockUser],
        total: 1,
        page: 1,
        totalPages: 1,
      };
      mockUsersService.getUsers.mockResolvedValue(expected);

      const result = await controller.getUsers({ page: 1, limit: 20 });

      expect(result).toEqual(expected);
    });
  });

  describe('getPendingUsers', () => {
    it('should return pending users', async () => {
      mockUsersService.getPendingUsers.mockResolvedValue({
        data: [{ ...mockUser, status: 'PENDING' }],
      });

      const result = await controller.getPendingUsers();

      expect(result.data[0].status).toBe('PENDING');
    });
  });

  describe('approveUser', () => {
    it('should approve user', async () => {
      mockUsersService.approveUser.mockResolvedValue({
        ...mockUser,
        status: 'ACTIVE',
      });

      const result = await controller.approveUser('user-2', 'president-1');

      expect(usersService.approveUser).toHaveBeenCalledWith(
        'user-2',
        'president-1',
      );
    });
  });

  describe('rejectUser', () => {
    it('should reject user', async () => {
      mockUsersService.rejectUser.mockResolvedValue({
        message: '가입이 거절되었습니다',
      });

      const result = await controller.rejectUser('user-2');

      expect(result.message).toBe('가입이 거절되었습니다');
    });
  });

  describe('changeRole', () => {
    it('should change user role', async () => {
      mockUsersService.changeRole.mockResolvedValue({
        ...mockUser,
        role: 'TREASURER',
      });

      const result = await controller.changeRole('user-2', {
        role: 'TREASURER' as any,
      });

      expect(result.role).toBe('TREASURER');
    });
  });

  describe('removeUser', () => {
    it('should remove user', async () => {
      mockUsersService.removeUser.mockResolvedValue({
        message: '강제 탈퇴 처리되었습니다',
      });

      const result = await controller.removeUser('user-2');

      expect(result.message).toBe('강제 탈퇴 처리되었습니다');
    });
  });
});
