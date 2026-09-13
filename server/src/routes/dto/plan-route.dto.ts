import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class PointDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class PlanRouteDto {
  @ValidateNested()
  @Type(() => PointDto)
  from!: PointDto;

  @ValidateNested()
  @Type(() => PointDto)
  to!: PointDto;

  // Night up-weights sexual_offence/robbery/assault/homicide exposure.
  @IsOptional()
  @IsIn(['day', 'night'])
  time?: 'day' | 'night';
}
