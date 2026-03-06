import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
        university: '서울대학교',
      };
      const expected = {
        id: 'user-1',
        email: dto.email,
        name: dto.name,
        status: 'PENDING',
      };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(result).toEqual(expected);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login with dto', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const expected = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: 'user-1' },
      };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(result).toEqual(expected);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh with refreshToken', async () => {
      const dto = { refreshToken: 'valid-refresh' };
      const expected = {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      };
      mockAuthService.refresh.mockResolvedValue(expected);

      const result = await controller.refresh(dto);

      expect(result).toEqual(expected);
      expect(authService.refresh).toHaveBeenCalledWith('valid-refresh');
    });
  });

  describe('logout', () => {
    it('should call authService.logout with userId', async () => {
      mockAuthService.logout.mockResolvedValue({
        message: '로그아웃 되었습니다',
      });

      const result = await controller.logout('user-1');

      expect(result.message).toBe('로그아웃 되었습니다');
      expect(authService.logout).toHaveBeenCalledWith('user-1');
    });
  });
});
