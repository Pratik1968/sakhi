import { IsIn, IsISO8601, IsOptional } from 'class-validator';
import { PaginationDto } from './common.dto';

export class SosQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'RESOLVED', 'CANCELLED'])
  status?: string;

  // Filters on SosEvent.startedAt.
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
