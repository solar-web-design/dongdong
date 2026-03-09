import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TenantStatus, Role, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (!tenant) throw new NotFoundException('테넌트를 찾을 수 없습니다');
    if (tenant.status === 'SUSPENDED') {
      throw new NotFoundException('비활성화된 동문회입니다');
    }
    return tenant;
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });
    if (!tenant) throw new NotFoundException('테넌트를 찾을 수 없습니다');
    return tenant;
  }

  async searchPublic(q?: string) {
    const where: Prisma.TenantWhereInput = {
      status: 'ACTIVE',
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { universityName: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
    };
    const data = await this.prisma.tenant.findMany({
      where,
      select: { id: true, name: true, universityName: true, slug: true, description: true },
      orderBy: { name: 'asc' },
      take: 20,
    });
    return { data };
  }

  async findAll(query: { page?: number; limit?: number; search?: string; status?: TenantStatus }) {
    const { page = 1, limit = 20, search, status } = query;
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { universityName: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { users: true } } },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('이미 사용 중인 슬러그입니다');
    }
    return this.prisma.tenant.create({ data: dto });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findById(id);
    if (dto.slug) {
      const existing = await this.prisma.tenant.findUnique({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('이미 사용 중인 슬러그입니다');
      }
    }
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    const userCount = await this.prisma.user.count({ where: { tenantId: id } });
    if (userCount > 0) {
      throw new ConflictException('회원이 존재하는 테넌트는 삭제할 수 없습니다');
    }
    await this.prisma.tenant.delete({ where: { id } });
    return { message: '테넌트가 삭제되었습니다' };
  }

  async getStats(id: string) {
    await this.findById(id);
    const [userCount, postCount, meetingCount] = await Promise.all([
      this.prisma.user.count({ where: { tenantId: id, status: 'ACTIVE' } }),
      this.prisma.post.count({ where: { tenantId: id } }),
      this.prisma.meeting.count({ where: { tenantId: id } }),
    ]);
    return { userCount, postCount, meetingCount };
  }

  async getTenantUsers(tenantId: string, status?: string) {
    await this.findById(tenantId);
    const where: Prisma.UserWhereInput = {
      tenantId,
      isSuperAdmin: false,
      ...(status && { status: status as any }),
    };
    const data = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        department: true,
        admissionYear: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return { data };
  }

  async approveUserAsRole(tenantId: string, userId: string, role: string, approvedById: string) {
    await this.findById(tenantId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('회원을 찾을 수 없습니다');
    if (user.tenantId !== tenantId) throw new ForbiddenException('해당 테넌트의 회원이 아닙니다');
    if (user.status !== 'PENDING') throw new ForbiddenException('승인 대기 상태가 아닙니다');

    const validRoles: string[] = Object.values(Role);
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`유효하지 않은 역할입니다: ${role}`);
    }

    // 회장 역할 부여 시 기존 회장이 있으면 차단
    if (role === 'PRESIDENT') {
      const existingPresident = await this.prisma.user.findFirst({
        where: { tenantId, role: 'PRESIDENT', status: 'ACTIVE' },
      });
      if (existingPresident) {
        throw new ConflictException('이미 회장이 존재합니다. 기존 회장의 역할을 변경한 후 시도하세요.');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE', role: role as Role, approvedById },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        department: true,
        admissionYear: true,
        createdAt: true,
      },
    });
  }

  async changeUserRole(tenantId: string, userId: string, role: string) {
    await this.findById(tenantId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('회원을 찾을 수 없습니다');
    if (user.tenantId !== tenantId) throw new ForbiddenException('해당 테넌트의 회원이 아닙니다');
    if (user.status !== 'ACTIVE') throw new ForbiddenException('활성 상태의 회원만 역할을 변경할 수 있습니다');

    const validRoles: string[] = Object.values(Role);
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`유효하지 않은 역할입니다: ${role}`);
    }

    // 회장 역할 부여 시 기존 회장이 있으면 일반회원으로 변경
    if (role === 'PRESIDENT') {
      const existingPresident = await this.prisma.user.findFirst({
        where: { tenantId, role: 'PRESIDENT', status: 'ACTIVE', id: { not: userId } },
      });
      if (existingPresident) {
        await this.prisma.user.update({
          where: { id: existingPresident.id },
          data: { role: 'MEMBER' },
        });
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        department: true,
        admissionYear: true,
        createdAt: true,
      },
    });
  }

  async rejectUser(tenantId: string, userId: string) {
    await this.findById(tenantId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('회원을 찾을 수 없습니다');
    if (user.tenantId !== tenantId) throw new ForbiddenException('해당 테넌트의 회원이 아닙니다');
    if (user.status !== 'PENDING') throw new ForbiddenException('승인 대기 상태가 아닙니다');

    await this.prisma.user.delete({ where: { id: userId } });
    return { message: '가입이 거절되었습니다' };
  }
}
