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
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { QueryMeetingDto } from './dto/query-meeting.dto';
import { RsvpDto } from './dto/rsvp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('meetings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Get()
  findAll(@Query() query: QueryMeetingDto) {
    return this.meetingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Post()
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT, Role.TREASURER)
  create(@Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT, Role.TREASURER)
  update(@Param('id') id: string, @Body() dto: UpdateMeetingDto) {
    return this.meetingsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT)
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }

  @Post(':id/rsvp')
  rsvp(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RsvpDto,
  ) {
    return this.meetingsService.rsvp(id, userId, dto);
  }
}
