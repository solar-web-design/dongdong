import { IsEnum } from 'class-validator';

enum ReportAction {
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export class ResolveReportDto {
  @IsEnum(ReportAction)
  action: ReportAction;
}
