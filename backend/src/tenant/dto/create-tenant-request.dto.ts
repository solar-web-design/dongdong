import { IsString, IsEmail, IsOptional, IsInt, MaxLength, Matches, Min, Max } from 'class-validator';

export class CreateTenantRequestDto {
  @IsString()
  @MaxLength(50)
  applicantName: string;

  @IsEmail()
  applicantEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  applicantPhone?: string;

  @IsString()
  @MaxLength(100)
  universityName: string;

  @IsString()
  @MaxLength(100)
  clubName: string;

  @IsString()
  @MaxLength(30)
  @Matches(/^[a-z0-9-]+$/, { message: '슬러그는 영소문자, 숫자, 하이픈만 사용 가능합니다' })
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  expectedMembers?: number;
}
