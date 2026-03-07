import { IsString, MaxLength } from 'class-validator';

export class SendDmDto {
  @IsString()
  @MaxLength(5000)
  content: string;
}
