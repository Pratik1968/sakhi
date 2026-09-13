import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class NearbyPlacesDto {
  // Global ValidationPipe transform:true coerces the ?lat= query string to a number.
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsString()
  @IsIn(['police', 'hospital', 'support'])
  category?: string;
}
