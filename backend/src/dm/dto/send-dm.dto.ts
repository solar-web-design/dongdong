import { IsString, MaxLength, IsOptional } from 'class-validator';

export class SendDmDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(5000)
  content: string;
}
