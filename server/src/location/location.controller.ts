import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { LocationService } from './location.service';
import { LocationPingDto } from './dto/location-ping.dto';

@UseGuards(JwtAuthGuard)
@Controller('location')
export class LocationController {
  constructor(private readonly location: LocationService) {}

  @Post()
  ping(@CurrentUser() user: AuthUser, @Body() dto: LocationPingDto) {
    return this.location.ping(user.id, user.name, dto);
  }

  @Get(':userId/latest')
  latest(@CurrentUser() user: AuthUser, @Param('userId') userId: string) {
    const target = userId === 'me' ? user.id : userId;
    return this.location.latest(user.id, target);
  }
}
