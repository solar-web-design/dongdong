import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TenantStatus } from '@prisma/client';
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
}
