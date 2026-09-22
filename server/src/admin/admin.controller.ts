import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { ContactsQueryDto } from './dto/contacts-query.dto';
import { CrimeQueryDto } from './dto/crime-query.dto';
import { IncidentsQueryDto } from './dto/incidents-query.dto';
import { SosQueryDto } from './dto/sos-query.dto';
import { SummaryQueryDto } from './dto/summary-query.dto';
import { UsersQueryDto } from './dto/users-query.dto';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  private sendCsv(res: Response, filenameBase: string, csv: string) {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filenameBase}-${stamp}.csv"`,
    );
    res.send(csv);
  }

  @Get('summary')
  summary(@Query() q: SummaryQueryDto) {
    return this.admin.summary(q);
  }

  @Get('users')
  async users(@Query() q: UsersQueryDto, @Res({ passthrough: true }) res: Response) {
    if (q.format === 'csv') return this.sendCsv(res, 'users', await this.admin.usersCsv(q));
    return this.admin.users(q);
  }

  @Get('incidents')
  async incidents(@Query() q: IncidentsQueryDto, @Res({ passthrough: true }) res: Response) {
    if (q.format === 'csv')
      return this.sendCsv(res, 'incidents', await this.admin.incidentsCsv(q));
    return this.admin.incidents(q);
  }

  @Get('incidents/analytics')
  incidentAnalytics(@Query() q: IncidentsQueryDto) {
    return this.admin.incidentAnalytics(q);
  }

  @Get('incidents/filters')
  incidentFilters() {
    return this.admin.incidentFilters();
  }

  @Get('hotspots')
  hotspots(@Query() q: CrimeQueryDto) {
    return this.admin.hotspots(q);
  }

  @Get('crime/filters')
  crimeFilters() {
    return this.admin.crimeFilters();
  }

  @Get('sos')
  async sos(@Query() q: SosQueryDto, @Res({ passthrough: true }) res: Response) {
    if (q.format === 'csv') return this.sendCsv(res, 'sos', await this.admin.sosCsv(q));
    return this.admin.sos(q);
  }

  @Get('contacts')
  contacts(@Query() q: ContactsQueryDto) {
    return this.admin.contacts(q);
  }

  @Get('health')
  health() {
    return this.admin.health();
  }
}
