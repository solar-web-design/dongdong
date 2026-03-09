import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import * as express from 'express';
import { TenantStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tenants')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  // 공개: 현재 테넌트 정보 (서브도메인 기반)
  @Get('current')
  async getCurrent(@Req() req: express.Request) {
    if (!req.tenantSlug) {
      return null;
    }
    return this.tenantService.findBySlug(req.tenantSlug);
  }

  // 공개: 슬러그로 테넌트 조회
  @Get('by-slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug);
  }

  // 공개: 동문회 검색 (이름/대학명)
  @Get('search')
  async search(@Query('q') q?: string) {
    return this.tenantService.searchPublic(q);
  }

  // 슈퍼어드민: 테넌트 목록
  @Get()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: TenantStatus,
  ) {
    return this.tenantService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      status,
    });
  }

  // 슈퍼어드민: 테넌트 생성
  @Post()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantService.create(dto);
  }

  // 슈퍼어드민: 테넌트 상세
  @Get(':id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async findOne(@Param('id') id: string) {
    return this.tenantService.findById(id);
  }

  // 슈퍼어드민: 테넌트 통계
  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getStats(@Param('id') id: string) {
    return this.tenantService.getStats(id);
  }

  // 슈퍼어드민: 테넌트 수정
  @Patch(':id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantService.update(id, dto);
  }

  // 슈퍼어드민: 테넌트 삭제
  @Delete(':id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }

  // 슈퍼어드민: 테넌트 회원 목록
  @Get(':id/users')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getUsers(
    @Param('id') id: string,
    @Query('status') status?: string,
  ) {
    return this.tenantService.getTenantUsers(id, status);
  }

  // 슈퍼어드민: 회원 승인 + 역할 지정 (회장 부트스트랩 포함)
  @Patch(':id/users/:userId/approve')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async approveUser(
    @Param('id') tenantId: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
    @CurrentUser('id') approvedById: string,
  ) {
    return this.tenantService.approveUserAsRole(tenantId, userId, role, approvedById);
  }

  // 슈퍼어드민: 활성 회원 역할 변경
  @Patch(':id/users/:userId/role')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async changeUserRole(
    @Param('id') tenantId: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
  ) {
    return this.tenantService.changeUserRole(tenantId, userId, role);
  }

  // 슈퍼어드민: 회원 거절
  @Delete(':id/users/:userId')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async rejectUser(
    @Param('id') tenantId: string,
    @Param('userId') userId: string,
  ) {
    return this.tenantService.rejectUser(tenantId, userId);
  }
}
