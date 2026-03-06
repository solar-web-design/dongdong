import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MeetingsService', () => {
  let service: MeetingsService;

  const mockPrisma = {
    meeting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    meetingMember: {
      count: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockMeeting = {
    id: 'meeting-1',
    title: '정기 모임',
    description: '3월 정기 모임',
    location: '강남',
    date: new Date('2025-04-01'),
    maxMembers: 10,
    fee: 30000,
    status: 'UPCOMING',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated meetings with memberCount', async () => {
      mockPrisma.meeting.findMany.mockResolvedValue([
        { ...mockMeeting, _count: { members: 5 } },
      ]);
      mockPrisma.meeting.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].memberCount).toBe(5);
      expect(result.data[0]._count).toBeUndefined();
    });

    it('should filter by status', async () => {
      mockPrisma.meeting.findMany.mockResolvedValue([]);
      mockPrisma.meeting.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20, status: 'UPCOMING' as any });

      expect(mockPrisma.meeting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'UPCOMING' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return meeting with members', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...mockMeeting,
        members: [{ user: { id: 'user-1', name: '홍길동' } }],
      });

      const result = await service.findOne('meeting-1');

      expect(result.title).toBe('정기 모임');
      expect(result.members).toHaveLength(1);
    });

    it('should throw NotFoundException for non-existent meeting', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a meeting', async () => {
      const dto = {
        title: '새 모임',
        date: '2025-05-01',
        location: '홍대',
      };
      mockPrisma.meeting.create.mockResolvedValue({
        ...mockMeeting,
        ...dto,
        date: new Date(dto.date),
      });

      const result = await service.create(dto as any);

      expect(mockPrisma.meeting.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          date: expect.any(Date),
        }),
      });
    });
  });

  describe('update', () => {
    it('should update a meeting', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(mockMeeting);
      mockPrisma.meeting.update.mockResolvedValue({
        ...mockMeeting,
        title: '수정된 모임',
      });

      const result = await service.update('meeting-1', { title: '수정된 모임' } as any);

      expect(result.title).toBe('수정된 모임');
    });

    it('should update date when provided', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(mockMeeting);
      mockPrisma.meeting.update.mockResolvedValue(mockMeeting);

      await service.update('meeting-1', { date: '2025-06-01' } as any);

      expect(mockPrisma.meeting.update).toHaveBeenCalledWith({
        where: { id: 'meeting-1' },
        data: expect.objectContaining({ date: expect.any(Date) }),
      });
    });

    it('should throw NotFoundException for non-existent meeting', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { title: '수정' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a meeting', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(mockMeeting);
      mockPrisma.meeting.delete.mockResolvedValue({});

      const result = await service.remove('meeting-1');

      expect(result.message).toBe('모임이 삭제되었습니다');
    });

    it('should throw NotFoundException for non-existent meeting', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('rsvp', () => {
    it('should create RSVP for attending', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(mockMeeting);
      mockPrisma.meetingMember.count.mockResolvedValue(3);
      mockPrisma.meetingMember.findUnique.mockResolvedValue(null);
      mockPrisma.meetingMember.upsert.mockResolvedValue({
        meetingId: 'meeting-1',
        userId: 'user-1',
        rsvp: 'ATTENDING',
      });

      const result = await service.rsvp('meeting-1', 'user-1', {
        rsvp: 'ATTENDING' as any,
      });

      expect(result.rsvp).toBe('ATTENDING');
    });

    it('should throw BadRequestException for cancelled meeting', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...mockMeeting,
        status: 'CANCELLED',
      });

      await expect(
        service.rsvp('meeting-1', 'user-1', { rsvp: 'ATTENDING' as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for completed meeting', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...mockMeeting,
        status: 'COMPLETED',
      });

      await expect(
        service.rsvp('meeting-1', 'user-1', { rsvp: 'ATTENDING' as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when max members exceeded', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...mockMeeting,
        maxMembers: 5,
      });
      mockPrisma.meetingMember.count.mockResolvedValue(5);
      mockPrisma.meetingMember.findUnique.mockResolvedValue(null);

      await expect(
        service.rsvp('meeting-1', 'user-1', { rsvp: 'ATTENDING' as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow RSVP when already attending (not new)', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...mockMeeting,
        maxMembers: 5,
      });
      mockPrisma.meetingMember.count.mockResolvedValue(5);
      mockPrisma.meetingMember.findUnique.mockResolvedValue({
        rsvp: 'ATTENDING',
      });
      mockPrisma.meetingMember.upsert.mockResolvedValue({
        rsvp: 'ATTENDING',
      });

      const result = await service.rsvp('meeting-1', 'user-1', {
        rsvp: 'ATTENDING' as any,
      });

      expect(result.rsvp).toBe('ATTENDING');
    });

    it('should allow NOT_ATTENDING without max member check', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(mockMeeting);
      mockPrisma.meetingMember.upsert.mockResolvedValue({
        rsvp: 'NOT_ATTENDING',
      });

      const result = await service.rsvp('meeting-1', 'user-1', {
        rsvp: 'NOT_ATTENDING' as any,
      });

      expect(result.rsvp).toBe('NOT_ATTENDING');
    });
  });
});
