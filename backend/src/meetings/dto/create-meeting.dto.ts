import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxMembers?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fee?: number;
}
