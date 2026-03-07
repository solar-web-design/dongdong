import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockResponse = () => {
  const res: any = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (cookies: Record<string, string> = {}, body: any = {}) => {
  return { cookies, body } as any;
};

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
    it('should set cookies and return user', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const loginResult = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: 'user-1' },
      };
      mockAuthService.login.mockResolvedValue(loginResult);
      const res = mockResponse();

      const result = await controller.login(dto, res);

      expect(result).toEqual({ user: { id: 'user-1' } });
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens from cookie', async () => {
      const expected = {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      };
      mockAuthService.refresh.mockResolvedValue(expected);
      const req = mockRequest({ refreshToken: 'valid-refresh' });
      const res = mockResponse();

      const result = await controller.refresh(req, res);

      expect(result).toEqual({ message: '토큰이 갱신되었습니다' });
      expect(authService.refresh).toHaveBeenCalledWith('valid-refresh');
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('logout', () => {
    it('should clear cookies and call authService.logout', async () => {
      mockAuthService.logout.mockResolvedValue({
        message: '로그아웃 되었습니다',
      });
      const res = mockResponse();

      const result = await controller.logout('user-1', res);

      expect(result.message).toBe('로그아웃 되었습니다');
      expect(authService.logout).toHaveBeenCalledWith('user-1');
      expect(res.clearCookie).toHaveBeenCalledTimes(2);
    });
  });
});
