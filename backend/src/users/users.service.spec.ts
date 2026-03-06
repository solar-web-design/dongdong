import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    user: {
      findUniqueOrThrow: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: '홍길동',
    phone: null,
    profileImage: null,
    role: 'MEMBER',
    status: 'ACTIVE',
    university: '서울대학교',
    department: '컴퓨터공학과',
    admissionYear: 2018,
    graduationYear: 2022,
    studentId: null,
    bio: null,
    company: null,
    position: null,
    location: null,
    website: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);

      const result = await service.getMe('user-1');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.any(Object),
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const dto = { name: '김철수', bio: '안녕하세요' };
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, ...dto });

      const result = await service.updateProfile('user-1', dto);

      expect(result.name).toBe('김철수');
      expect(result.bio).toBe('안녕하세요');
    });
  });

  describe('getUserById', () => {
    it('should return user public profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-2',
        name: '이영희',
        profileImage: null,
        role: 'MEMBER',
        university: '서울대학교',
        department: '경영학과',
        admissionYear: 2019,
        graduationYear: 2023,
        bio: null,
        company: null,
        position: null,
        location: null,
        website: null,
      });

      const result = await service.getUserById('user-2');
      expect(result.name).toBe('이영희');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUsers', () => {
    it('should return paginated user list', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.getUsers({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by search keyword', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.getUsers({ page: 1, limit: 20, search: '홍길동' });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
            OR: expect.arrayContaining([
              { name: { contains: '홍길동', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should filter by department', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.getUsers({
        page: 1,
        limit: 20,
        department: '컴퓨터공학과',
      });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department: '컴퓨터공학과',
          }),
        }),
      );
    });

    it('should use default page and limit', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      const result = await service.getUsers({});

      expect(result.page).toBe(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('getPendingUsers', () => {
    it('should return pending users', async () => {
      const pendingUser = { ...mockUser, status: 'PENDING' };
      mockPrisma.user.findMany.mockResolvedValue([pendingUser]);

      const result = await service.getPendingUsers();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('PENDING');
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'asc' },
        }),
      );
    });
  });

  describe('approveUser', () => {
    it('should approve a pending user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: 'PENDING',
      });
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        status: 'ACTIVE',
      });

      const result = await service.approveUser('user-1', 'president-1');

      expect(result.status).toBe('ACTIVE');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { status: 'ACTIVE', approvedById: 'president-1' },
        select: expect.any(Object),
      });
    });

    it('should throw ForbiddenException if user is not PENDING', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser); // ACTIVE status

      await expect(
        service.approveUser('user-1', 'president-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.approveUser('non-existent', 'president-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('rejectUser', () => {
    it('should reject and delete a pending user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: 'PENDING',
      });
      mockPrisma.user.delete.mockResolvedValue({});

      const result = await service.rejectUser('user-1');

      expect(result.message).toBe('가입이 거절되었습니다');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw ForbiddenException if user is not PENDING', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.rejectUser('user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('changeRole', () => {
    it('should change user role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        role: 'VICE_PRESIDENT',
      });

      const result = await service.changeRole('user-1', {
        role: 'VICE_PRESIDENT' as any,
      });

      expect(result.role).toBe('VICE_PRESIDENT');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changeRole('non-existent', { role: 'MEMBER' as any }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeUser', () => {
    it('should set user status to WITHDRAWN', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        status: 'WITHDRAWN',
      });

      const result = await service.removeUser('user-1');

      expect(result.message).toBe('강제 탈퇴 처리되었습니다');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { status: 'WITHDRAWN' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.removeUser('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
