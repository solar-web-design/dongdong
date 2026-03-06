import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { MeetingStatus } from '@prisma/client';
import { CreateMeetingDto } from './create-meeting.dto';

export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus;
}
