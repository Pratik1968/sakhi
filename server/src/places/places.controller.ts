import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlacesService } from './places.service';
import { NearbyPlacesDto } from './dto/nearby-places.dto';

@UseGuards(JwtAuthGuard)
@Controller('places')
export class PlacesController {
  constructor(private readonly places: PlacesService) {}

  @Get('nearby')
  nearby(@Query() dto: NearbyPlacesDto) {
    return this.places.nearby(dto.lat, dto.lng, dto.category);
  }
}
