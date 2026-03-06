import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(10000)
  content: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
