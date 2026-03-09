import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import * as express from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax' as const,
  path: '/',
  ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 900000 } })
  register(@Body() dto: RegisterDto, @Req() req: express.Request) {
    return this.authService.register(dto, req.tenantId);
  }

  @Post('login')
  @Throttle({ short: { limit: 20, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
    const result = await this.authService.login(dto);
    res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 });
    res.cookie('refreshToken', result.refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { user: result.user };
  }

  @Post('refresh')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return { message: '리프레시 토큰이 없습니다' };
    }
    const tokens = await this.authService.refresh(refreshToken);
    res.cookie('accessToken', tokens.accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { message: '토큰이 갱신되었습니다' };
  }

  @Post('oauth/kakao')
  @Throttle({ short: { limit: 20, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async oauthKakao(@Body('code') code: string, @Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const result = await this.authService.oauthKakao(code, req.tenantId);
    res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 });
    res.cookie('refreshToken', result.refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { user: result.user, isNewUser: result.isNewUser };
  }

  @Post('oauth/google')
  @Throttle({ short: { limit: 20, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async oauthGoogle(@Body('code') code: string, @Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const result = await this.authService.oauthGoogle(code, req.tenantId);
    res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 });
    res.cookie('refreshToken', result.refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { user: result.user, isNewUser: result.isNewUser };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('id') userId: string, @Res({ passthrough: true }) res: express.Response) {
    // 새 쿠키(domain 포함) 삭제
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    // 이전 쿠키(domain 없는) 삭제 — 마이그레이션 호환
    const { domain: _d, ...noDomainOpts } = COOKIE_OPTIONS as any;
    res.clearCookie('accessToken', noDomainOpts);
    res.clearCookie('refreshToken', noDomainOpts);
    return this.authService.logout(userId);
  }
}
