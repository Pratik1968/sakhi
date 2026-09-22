import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './common.dto';

export class IncidentsQueryDto extends PaginationDto {
  // Incident.type: harassment | unsafe-area | stalking | other (free string,
  // so no @IsIn — new types can appear without a code change).
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  area?: string;

  // Free-text match against area + description.
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsIn(['newest', 'oldest'])
  sort?: 'newest' | 'oldest' = 'newest';
}
