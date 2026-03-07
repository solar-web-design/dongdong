import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';

enum ReportType {
  POST = 'POST',
  COMMENT = 'COMMENT',
}

enum ReportReason {
  SPAM = 'SPAM',
  ABUSE = 'ABUSE',
  HARASSMENT = 'HARASSMENT',
  FALSE_INFO = 'FALSE_INFO',
  INAPPROPRIATE = 'INAPPROPRIATE',
  OTHER = 'OTHER',
}

export class CreateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ValidateIf((o) => o.type === 'POST')
  @IsUUID()
  postId?: string;

  @ValidateIf((o) => o.type === 'COMMENT')
  @IsUUID()
  commentId?: string;
}
