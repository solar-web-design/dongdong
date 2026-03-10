import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId?: string;
}

function extractJwtFromCookieOrHeader(req: Request): string | null {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다');
    super({
      jwtFromRequest: extractJwtFromCookieOrHeader,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { tenant: { select: { id: true, slug: true, status: true } } },
    });
    if (!user || user.status === 'WITHDRAWN' || user.status === 'SUSPENDED') {
      throw new UnauthorizedException();
    }

    // 테넌트 격리: 토큰의 tenantId와 요청의 tenantId가 일치해야 함
    const reqTenantId = (req as any).tenantId;
    if (reqTenantId && payload.tenantId !== reqTenantId) {
      throw new UnauthorizedException('해당 동문회에 대한 접근 권한이 없습니다');
    }

    return user;
  }
}
