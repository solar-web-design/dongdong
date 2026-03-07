import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantSlug?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    // 서브도메인에서 테넌트 slug 추출
    const host = req.headers.host || '';
    const parts = host.split('.');

    // localhost:3000 또는 IP 접속 → 테넌트 없음 (랜딩 또는 슈퍼어드민)
    // xxx.dongdong.kr → parts = ['xxx', 'dongdong', 'kr']
    // 헤더로 직접 지정도 가능 (개발 편의)
    let slug = req.headers['x-tenant-slug'] as string | undefined;

    if (!slug && parts.length >= 3) {
      const sub = parts[0];
      if (sub !== 'www' && sub !== 'api') {
        slug = sub;
      }
    }

    if (slug) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug },
        select: { id: true, slug: true, status: true },
      });
      if (tenant && tenant.status === 'ACTIVE') {
        req.tenantId = tenant.id;
        req.tenantSlug = tenant.slug;
      }
    }

    next();
  }
}
