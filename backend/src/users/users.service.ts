import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { QueryUsersDto } from './dto/query-users.dto';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  profileImage: true,
  role: true,
  status: true,
  university: true,
  department: true,
  admissionYear: true,
  graduationYear: true,
  studentId: true,
  bio: true,
  company: true,
  position: true,
  location: true,
  website: true,
  createdAt: true,
  isSuperAdmin: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: USER_SELECT,
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.profileImage === '') {
      data.profileImage = null;
    }
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: USER_SELECT,
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        profileImage: true,
        role: true,
        university: true,
        department: true,
        admissionYear: true,
        graduationYear: true,
        bio: true,
        company: true,
        position: true,
        location: true,
        website: true,
      },
    });
    if (!user) throw new NotFoundException('회원을 찾을 수 없습니다');
    return user;
  }

  async getUsers(query: QueryUsersDto, tenantId?: string) {
    if (!tenantId) return { data: [], total: 0, page: 1, totalPages: 0 };
    const { page = 1, limit = 20, search, department, admissionYear } = query;
    const where: Prisma.UserWhereInput = {
      status: 'ACTIVE',
      isSuperAdmin: false,
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(department && { department }),
      ...(admissionYear && { admissionYear }),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPendingUsers(tenantId?: string) {
    if (!tenantId) return { data: [] };
    return {
      data: await this.prisma.user.findMany({
        where: { status: 'PENDING', isSuperAdmin: false, tenantId },
        select: USER_SELECT,
        orderBy: { createdAt: 'asc' },
      }),
    };
  }

  async approveUser(id: string, approvedById: string) {
    const user = await this.findUserOrThrow(id);
    if (user.status !== 'PENDING') {
      throw new ForbiddenException('승인 대기 상태가 아닙니다');
    }
    return this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE', approvedById },
      select: USER_SELECT,
    });
  }

  async rejectUser(id: string) {
    const user = await this.findUserOrThrow(id);
    if (user.status !== 'PENDING') {
      throw new ForbiddenException('승인 대기 상태가 아닙니다');
    }
    await this.prisma.user.delete({ where: { id } });
    return { message: '가입이 거절되었습니다' };
  }

  async changeRole(id: string, dto: ChangeRoleDto, requestUser?: { isSuperAdmin?: boolean }) {
    if (dto.role === 'PRESIDENT' && !requestUser?.isSuperAdmin) {
      throw new ForbiddenException('회장 역할은 슈퍼어드민만 부여할 수 있습니다');
    }
    const user = await this.findUserOrThrow(id);
    // 현재 회장이 자신을 강등하려는 경우, 다른 회장이 있어야만 허용
    if (user.role === 'PRESIDENT' && dto.role !== 'PRESIDENT' && user.tenantId) {
      const otherPresident = await this.prisma.user.findFirst({
        where: { tenantId: user.tenantId, role: 'PRESIDENT', status: 'ACTIVE', id: { not: id } },
      });
      if (!otherPresident) {
        throw new ForbiddenException('회장이 최소 1명은 있어야 합니다. 먼저 다른 회원을 회장으로 지정하세요.');
      }
    }
    // 회장으로 변경 시 같은 테넌트의 기존 회장을 일반회원으로 변경
    if (dto.role === 'PRESIDENT' && user.tenantId) {
      const existingPresident = await this.prisma.user.findFirst({
        where: { tenantId: user.tenantId, role: 'PRESIDENT', status: 'ACTIVE', id: { not: id } },
      });
      if (existingPresident) {
        await this.prisma.user.update({
          where: { id: existingPresident.id },
          data: { role: 'MEMBER' },
        });
      }
    }
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: USER_SELECT,
    });
  }

  async withdrawUser(userId: string, password?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, status: true },
    });
    if (!user) throw new NotFoundException('회원을 찾을 수 없습니다');

    if (user.status === 'WITHDRAWN') {
      throw new ForbiddenException('이미 탈퇴한 계정입니다');
    }

    // 비밀번호가 설정된 사용자는 비밀번호 검증 필수
    if (user.password) {
      if (!password) {
        throw new UnauthorizedException('비밀번호를 입력해주세요');
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('비밀번호가 올바르지 않습니다');
      }
    }

    // 개인정보 파기 처리
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `withdrawn_${randomUUID()}@deleted.local`,
        name: '탈퇴한 사용자',
        phone: null,
        profileImage: null,
        department: null,
        studentId: null,
        bio: null,
        company: null,
        position: null,
        location: null,
        website: null,
        kakaoId: null,
        googleId: null,
        password: null,
        refreshToken: null,
        status: 'WITHDRAWN',
      },
    });

    return { message: '탈퇴가 완료되었습니다' };
  }

  async removeUser(id: string) {
    await this.findUserOrThrow(id);
    await this.prisma.user.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });
    return { message: '강제 탈퇴 처리되었습니다' };
  }

  private async findUserOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('회원을 찾을 수 없습니다');
    return user;
  }
}
