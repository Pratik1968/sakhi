import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('summary')
  summary() {
    return this.admin.summary();
  }

  @Get('users')
  users(@Query('limit') limit?: string) {
    return this.admin.users(limit ? Number(limit) : 100);
  }

  @Get('incidents/analytics')
  incidentAnalytics() {
    return this.admin.incidentAnalytics();
  }

  @Get('hotspots')
  hotspots() {
    return this.admin.hotspots();
  }

  @Get('sos')
  sos() {
    return this.admin.sos();
  }

  @Get('contacts')
  contacts() {
    return this.admin.contacts();
  }

  @Get('health')
  health() {
    return this.admin.health();
  }
}
