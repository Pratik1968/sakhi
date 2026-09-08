import { IsNumber, IsOptional } from 'class-validator';

export class LocationPingDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;
}
