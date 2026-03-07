import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateReportDto) {
    return this.reportsService.create(userId, dto);
  }

  @Get()
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT)
  findAll(@Query('status') status?: string) {
    return this.reportsService.findAll(status);
  }

  @Get('stats')
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT)
  getStats() {
    return this.reportsService.getStats();
  }

  @Patch(':id/resolve')
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT)
  resolve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ResolveReportDto,
  ) {
    return this.reportsService.resolve(id, userId, dto);
  }
}
