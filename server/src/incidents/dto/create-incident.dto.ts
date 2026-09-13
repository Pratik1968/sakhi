import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateIncidentDto {
  // harassment | unsafe-area | stalking | other
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
