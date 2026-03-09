import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantRequestDto } from './dto/create-tenant-request.dto';

@Injectable()
export class TenantRequestService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantRequestDto) {
    // 슬러그 중복 체크 (기존 테넌트)
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existingTenant) {
      throw new ConflictException('이미 사용 중인 서브도메인입니다');
    }

    // 동일 슬러그 대기 중 신청 체크
    const existingRequest = await this.prisma.tenantRequest.findFirst({
      where: { slug: dto.slug, status: 'PENDING' },
    });
    if (existingRequest) {
      throw new ConflictException('이미 동일한 서브도메인으로 신청이 진행 중입니다');
    }

    const request = await this.prisma.tenantRequest.create({ data: dto });
    return { message: '동문회 개설 신청이 완료되었습니다', id: request.id };
  }

  async findAll(status?: string) {
    const where = status ? { status: status as any } : {};
    const data = await this.prisma.tenantRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { data };
  }

  async approve(id: string, resolvedById: string) {
    const request = await this.prisma.tenantRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('신청을 찾을 수 없습니다');
    if (request.status !== 'PENDING') throw new ForbiddenException('이미 처리된 신청입니다');

    // 슬러그 중복 재확인
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: request.slug },
    });
    if (existingTenant) {
      throw new ConflictException('이미 사용 중인 서브도메인입니다');
    }

    // 트랜잭션으로 테넌트 생성 + 신청 승인
    const [tenant] = await this.prisma.$transaction([
      this.prisma.tenant.create({
        data: {
          slug: request.slug,
          name: request.clubName,
          universityName: request.universityName,
          description: request.description,
        },
      }),
      this.prisma.tenantRequest.update({
        where: { id },
        data: { status: 'APPROVED', resolvedAt: new Date(), resolvedById },
      }),
    ]);

    return { message: '동문회가 승인되어 생성되었습니다', tenant };
  }

  async reject(id: string, reason: string, resolvedById: string) {
    const request = await this.prisma.tenantRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('신청을 찾을 수 없습니다');
    if (request.status !== 'PENDING') throw new ForbiddenException('이미 처리된 신청입니다');

    await this.prisma.tenantRequest.update({
      where: { id },
      data: { status: 'REJECTED', rejectReason: reason, resolvedAt: new Date(), resolvedById },
    });

    return { message: '신청이 거절되었습니다' };
  }
}
