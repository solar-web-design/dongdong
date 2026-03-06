import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  ArrayMaxSize,
  IsUrl,
} from 'class-validator';
import { PostCategory } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(10000)
  content: string;

  @IsOptional()
  @IsEnum(PostCategory)
  category?: PostCategory;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  images?: string[];
}
