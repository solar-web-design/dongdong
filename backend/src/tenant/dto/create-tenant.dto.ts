import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsInt,
  Min,
} from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: '슬러그는 영소문자, 숫자, 하이픈만 가능합니다',
  })
  slug: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  universityName: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxMembers?: number;
}
