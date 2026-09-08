import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateIncidentDto {
  // harassment | unsafe-area | stalking | other
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
