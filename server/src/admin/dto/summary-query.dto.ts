import { IsISO8601, IsOptional } from 'class-validator';

// Optional window for the Overview KPIs. When omitted the service falls back to
// the default 7-day "new/recent" windows.
export class SummaryQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
