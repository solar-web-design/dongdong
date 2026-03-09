import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { QueryMeetingDto } from './dto/query-meeting.dto';
import { RsvpDto } from './dto/rsvp.dto';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryMeetingDto, tenantId?: string) {
    if (!tenantId) return { data: [], total: 0, page: 1, totalPages: 0 };
    const { page = 1, limit = 20, status } = query;
    const where: Prisma.MeetingWhereInput = {
      tenantId,
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.meeting.findMany({
        where,
        include: {
          _count: { select: { members: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.meeting.count({ where }),
    ]);

    return {
      data: data.map((m) => ({
        ...m,
        memberCount: m._count.members,
        _count: undefined,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, tenantId?: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, profileImage: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다');
    if (tenantId && meeting.tenantId !== tenantId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }
    return meeting;
  }

  async create(dto: CreateMeetingDto, tenantId?: string) {
    if (!tenantId) throw new ForbiddenException('테넌트 컨텍스트가 필요합니다');
    return this.prisma.meeting.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateMeetingDto, tenantId?: string) {
    await this.findOrThrow(id, tenantId);
    const { date, ...rest } = dto;
    return this.prisma.meeting.update({
      where: { id },
      data: {
        ...rest,
        ...(date && { date: new Date(date) }),
      },
    });
  }

  async remove(id: string, tenantId?: string) {
    await this.findOrThrow(id, tenantId);
    await this.prisma.meeting.delete({ where: { id } });
    return { message: '모임이 삭제되었습니다' };
  }

  async rsvp(meetingId: string, userId: string, dto: RsvpDto, tenantId?: string) {
    const meeting = await this.findOrThrow(meetingId, tenantId);

    if (meeting.status === 'CANCELLED') {
      throw new BadRequestException('취소된 모임입니다');
    }
    if (meeting.status === 'COMPLETED') {
      throw new BadRequestException('종료된 모임입니다');
    }

    // Check max members for ATTENDING
    if (dto.rsvp === 'ATTENDING' && meeting.maxMembers) {
      const attendingCount = await this.prisma.meetingMember.count({
        where: { meetingId, rsvp: 'ATTENDING' },
      });
      const existingRsvp = await this.prisma.meetingMember.findUnique({
        where: { meetingId_userId: { meetingId, userId } },
      });
      const isNewAttending = !existingRsvp || existingRsvp.rsvp !== 'ATTENDING';
      if (isNewAttending && attendingCount >= meeting.maxMembers) {
        throw new BadRequestException('참석 인원이 초과되었습니다');
      }
    }

    return this.prisma.meetingMember.upsert({
      where: { meetingId_userId: { meetingId, userId } },
      update: { rsvp: dto.rsvp },
      create: { meetingId, userId, rsvp: dto.rsvp },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  private async findOrThrow(id: string, tenantId?: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다');
    if (tenantId && meeting.tenantId !== tenantId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }
    return meeting;
  }
}
