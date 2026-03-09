import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

export function Roles(...roles: Role[]) {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    const metadataTarget = descriptor ? descriptor.value : target;
    Reflect.defineMetadata(ROLES_KEY, roles, metadataTarget);
    return descriptor ?? target;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    // SuperAdmin은 모든 역할 가드를 통과
    if (user.isSuperAdmin) return true;
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('권한이 없습니다');
    }
    return true;
  }
}
