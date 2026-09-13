import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoutesService } from './routes.service';
import { PlanRouteDto } from './dto/plan-route.dto';

@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}

  // Plan safe routes: OSRM alternatives ranked by crime-news exposure.
  @Post('plan')
  plan(@Body() dto: PlanRouteDto) {
    return this.routes.plan(dto);
  }

  // Forward-geocode a destination name → candidate coordinates (Hyderabad-biased).
  @Get('geocode')
  geocode(@Query('q') q: string) {
    return this.routes.geocode(q);
  }

  // Crime incidents feeding the planner — for the risk-zones map/heatmap.
  @Get('incidents')
  incidents() {
    return this.routes.listIncidents();
  }
}
