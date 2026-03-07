import {
  Injectable,
  NotFoundException,
  BadRequestException,
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

  async findAll(query: QueryMeetingDto) {
    const { page = 1, limit = 20, status } = query;
    const where: Prisma.MeetingWhereInput = {
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

  async findOne(id: string) {
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
    return meeting;
  }

  async create(dto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        ...dto,
        date: new Date(dto.date),
      },
    });
  }

  async update(id: string, dto: UpdateMeetingDto) {
    await this.findOrThrow(id);
    const { date, ...rest } = dto;
    return this.prisma.meeting.update({
      where: { id },
      data: {
        ...rest,
        ...(date && { date: new Date(date) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOrThrow(id);
    await this.prisma.meeting.delete({ where: { id } });
    return { message: '모임이 삭제되었습니다' };
  }

  async rsvp(meetingId: string, userId: string, dto: RsvpDto) {
    const meeting = await this.findOrThrow(meetingId);

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

  private async findOrThrow(id: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다');
    return meeting;
  }
}
