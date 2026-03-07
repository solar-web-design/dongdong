import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { QueryAnnouncementDto } from './dto/query-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryAnnouncementDto, tenantId?: string) {
    const { page = 1, limit = 20 } = query;
    const where: Prisma.AnnouncementWhereInput = {
      ...(tenantId && { tenantId }),
    };
    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, profileImage: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.announcement.count({ where }),
    ]);
    return { data, total };
  }

  async create(authorId: string, dto: CreateAnnouncementDto, tenantId?: string) {
    return this.prisma.announcement.create({
      data: { ...dto, authorId, ...(tenantId && { tenantId }) },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async update(
    id: string,
    userId: string,
    userRole: Role,
    dto: UpdateAnnouncementDto,
  ) {
    const announcement = await this.findOrThrow(id);
    if (
      announcement.authorId !== userId &&
      !([Role.PRESIDENT, Role.VICE_PRESIDENT] as Role[]).includes(userRole)
    ) {
      throw new ForbiddenException('수정 권한이 없습니다');
    }
    return this.prisma.announcement.update({
      where: { id },
      data: dto,
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const announcement = await this.findOrThrow(id);
    if (
      announcement.authorId !== userId &&
      !([Role.PRESIDENT, Role.VICE_PRESIDENT] as Role[]).includes(userRole)
    ) {
      throw new ForbiddenException('삭제 권한이 없습니다');
    }
    await this.prisma.announcement.delete({ where: { id } });
    return { message: '공지가 삭제되었습니다' };
  }

  private async findOrThrow(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) throw new NotFoundException('공지를 찾을 수 없습니다');
    return announcement;
  }
}
