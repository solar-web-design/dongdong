import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantRequestService } from './tenant-request.service';
import { CreateTenantRequestDto } from './dto/create-tenant-request.dto';

@Controller('tenant-requests')
export class TenantRequestController {
  constructor(private tenantRequestService: TenantRequestService) {}

  @Post()
  @Throttle({ short: { limit: 3, ttl: 3600000 } })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTenantRequestDto) {
    return this.tenantRequestService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  findAll(@Query('status') status?: string) {
    return this.tenantRequestService.findAll(status);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.tenantRequestService.approve(id, userId);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tenantRequestService.reject(id, reason, userId);
  }
}
