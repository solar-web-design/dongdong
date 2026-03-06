import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  receiptImage?: string;
}
