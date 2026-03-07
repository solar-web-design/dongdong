import { IsOptional, IsString } from 'class-validator';

export class WithdrawDto {
  @IsOptional()
  @IsString()
  password?: string;
}
