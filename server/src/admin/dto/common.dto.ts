import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

// Shared pagination + output-format params. The global ValidationPipe
// (transform:true) coerces the query strings to numbers via @Type.
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number = 25;

  // json (default) returns { rows, total, page, pageSize };
  // csv streams the full filtered set (pagination ignored) as text/csv.
  @IsOptional()
  @IsIn(['json', 'csv'])
  format?: 'json' | 'csv' = 'json';
}
