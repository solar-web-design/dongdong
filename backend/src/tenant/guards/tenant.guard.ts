import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.tenantId) {
      throw new ForbiddenException('테넌트 컨텍스트가 필요합니다');
    }
    return true;
  }
}
