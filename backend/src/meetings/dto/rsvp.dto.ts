import { IsEnum } from 'class-validator';
import { RSVPStatus } from '@prisma/client';

export class RsvpDto {
  @IsEnum(RSVPStatus)
  rsvp: RSVPStatus;
}
