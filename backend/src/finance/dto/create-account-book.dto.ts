import { IsString, IsInt, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateAccountBookDto {
  @IsIn(['INCOME', 'EXPENSE'])
  type: string;

  @IsInt()
  amount: number;

  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
