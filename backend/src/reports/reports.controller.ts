import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import * as express from 'express';
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
  create(@CurrentUser('id') userId: string, @Body() dto: CreateReportDto, @Req() req: express.Request) {
    return this.reportsService.create(userId, dto, req.tenantId);
  }

  @Get()
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT)
  findAll(@Query('status') status?: string, @Req() req?: express.Request) {
    return this.reportsService.findAll(status, req?.tenantId);
  }

  @Get('stats')
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT)
  getStats(@Req() req: express.Request) {
    return this.reportsService.getStats(req.tenantId);
  }

  @Patch(':id/resolve')
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT)
  resolve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ResolveReportDto,
    @Req() req: express.Request,
  ) {
    return this.reportsService.resolve(id, userId, dto, req.tenantId);
  }
}
