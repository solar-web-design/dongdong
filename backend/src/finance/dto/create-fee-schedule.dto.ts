import { IsEnum, IsInt, Min, IsDateString, IsOptional, IsString } from 'class-validator';
import { FeeType } from '@prisma/client';

export class CreateFeeScheduleDto {
  @IsEnum(FeeType)
  type: FeeType;

  @IsInt()
  @Min(0)
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
