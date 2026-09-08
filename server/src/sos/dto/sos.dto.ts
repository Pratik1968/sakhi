import { IsNumber, IsOptional, IsString } from 'class-validator';

export class StartSosDto {
  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
