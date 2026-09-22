import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';

// Filters for the crime-hotspots view. Applies to CrimeIncident rows; the
// user-report layer on the same map is filtered by date range only.
export class CrimeQueryDto {
  @IsOptional()
  @IsString()
  crimeType?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsString()
  commissionerate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  severityMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  severityMax?: number;

  @IsOptional()
  @IsIn(['day', 'night', 'unknown'])
  timeOfDay?: string;

  // Filters CrimeIncident.incidentDate and Incident.createdAt.
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
