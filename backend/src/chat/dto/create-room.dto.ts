import { IsString, IsOptional, IsEnum, IsArray, ArrayMinSize } from 'class-validator';
import { ChatRoomType } from '@prisma/client';

export class CreateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(ChatRoomType)
  type: ChatRoomType;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  memberIds: string[];
}
