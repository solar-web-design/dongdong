import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { Role } from '@prisma/client';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { QueryAnnouncementDto } from './dto/query-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Get()
  findAll(@Query() query: QueryAnnouncementDto, @Req() req: express.Request) {
    return this.announcementsService.findAll(query, req.tenantId);
  }

  @Post()
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT)
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAnnouncementDto,
    @Req() req: express.Request,
  ) {
    return this.announcementsService.create(userId, dto, req.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdateAnnouncementDto,
    @Req() req: express.Request,
  ) {
    return this.announcementsService.update(id, userId, role, dto, req.tenantId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Req() req: express.Request,
  ) {
    return this.announcementsService.remove(id, userId, role, req.tenantId);
  }
}
