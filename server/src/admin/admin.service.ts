import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContactsQueryDto } from './dto/contacts-query.dto';
import { CrimeQueryDto } from './dto/crime-query.dto';
import { IncidentsQueryDto } from './dto/incidents-query.dto';
import { SosQueryDto } from './dto/sos-query.dto';
import { SummaryQueryDto } from './dto/summary-query.dto';
import { UsersQueryDto } from './dto/users-query.dto';

export type Paginated<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private daysAgo(days: number): Date {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  // Build a Prisma date filter from optional ISO strings. Returns undefined
  // when neither bound is set so it can be spread into a `where` conditionally.
  private dateRange(from?: string, to?: string): { gte?: Date; lte?: Date } | undefined {
    const range: { gte?: Date; lte?: Date } = {};
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) range.gte = d;
    }
    if (to) {
      const d = new Date(to);
      // A date-only `to` (YYYY-MM-DD) parses to midnight; push to end-of-day so
      // the whole day is inclusive.
      if (!isNaN(d.getTime())) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(to)) d.setHours(23, 59, 59, 999);
        range.lte = d;
      }
    }
    return range.gte || range.lte ? range : undefined;
  }

  private paginate(page = 1, pageSize = 25): { skip: number; take: number } {
    const p = Math.max(1, Number(page) || 1);
    const size = Math.max(1, Math.min(200, Number(pageSize) || 25));
    return { skip: (p - 1) * size, take: size };
  }

  // Minimal RFC-4180 CSV: quote fields containing comma/quote/newline, double
  // internal quotes. `columns` is [{ key, label }].
  toCsv<T extends Record<string, unknown>>(
    rows: T[],
    columns: { key: keyof T & string; label: string }[],
  ): string {
    const escape = (v: unknown): string => {
      if (v == null) return '';
      let s: string;
      if (v instanceof Date) s = v.toISOString();
      else s = String(v);
      if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const header = columns.map((c) => escape(c.label)).join(',');
    const lines = rows.map((r) => columns.map((c) => escape(r[c.key])).join(','));
    return [header, ...lines].join('\r\n');
  }

  async summary(q: SummaryQueryDto = {}) {
    const range = this.dateRange(q.from, q.to);
    // "recent" window: explicit range if given, else last 7 days.
    const recentWhere = range ? { createdAt: range } : { createdAt: { gte: this.daysAgo(7) } };

    const [
      totalUsers,
      newUsers,
      totalIncidents,
      recentIncidents,
      activeSos,
      totalSos,
      guardiansActive,
      guardiansPending,
      evidence,
      places,
      crimeIncidents,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: recentWhere }),
      this.prisma.incident.count(),
      this.prisma.incident.count({ where: recentWhere }),
      this.prisma.sosEvent.count({ where: { status: 'ACTIVE' } }),
      this.prisma.sosEvent.count(),
      this.prisma.guardianLink.count({ where: { status: 'ACTIVE' } }),
      this.prisma.guardianLink.count({ where: { status: 'PENDING' } }),
      this.prisma.evidence.count(),
      this.prisma.nearbyPlace.count(),
      this.prisma.crimeIncident.count(),
    ]);

    return {
      totalUsers,
      // Field names kept as *7d for frontend compatibility; they now reflect the
      // selected window when from/to are supplied.
      newUsers7d: newUsers,
      totalIncidents,
      incidents7d: recentIncidents,
      activeSos,
      totalSos,
      guardiansActive,
      guardiansPending,
      evidence,
      places,
      crimeIncidents,
      window: range
        ? { from: range.gte ?? null, to: range.lte ?? null }
        : { from: this.daysAgo(7), to: null },
    };
  }

  private usersWhere(q: UsersQueryDto) {
    const where: Record<string, unknown> = {};
    const created = this.dateRange(q.from, q.to);
    if (created) where.createdAt = created;
    if (q.search) {
      const s = q.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  async users(q: UsersQueryDto = {}): Promise<Paginated<any>> {
    const where = this.usersWhere(q);
    const { skip, take } = this.paginate(q.page, q.pageSize);
    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: { select: { incidents: true, sosEvents: true, guardianLinks: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { rows, total, page: Number(q.page) || 1, pageSize: take };
  }

  async usersCsv(q: UsersQueryDto = {}): Promise<string> {
    const rows = await this.prisma.user.findMany({
      where: this.usersWhere(q),
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { incidents: true, sosEvents: true, guardianLinks: true } },
      },
    });
    const flat = rows.map((u) => ({
      name: u.name,
      email: u.email,
      phone: u.phone ?? '',
      joined: u.createdAt,
      reports: u._count.incidents,
      sos: u._count.sosEvents,
      guardians: u._count.guardianLinks,
    }));
    return this.toCsv(flat, [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'joined', label: 'Joined' },
      { key: 'reports', label: 'Reports' },
      { key: 'sos', label: 'SOS' },
      { key: 'guardians', label: 'Guardians' },
    ]);
  }

  private incidentsWhere(q: IncidentsQueryDto) {
    const where: Record<string, unknown> = {};
    if (q.type) where.type = q.type;
    if (q.area) where.area = { contains: q.area, mode: 'insensitive' };
    const created = this.dateRange(q.from, q.to);
    if (created) where.createdAt = created;
    if (q.search) {
      const s = q.search.trim();
      where.OR = [
        { area: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  async incidents(q: IncidentsQueryDto = {}): Promise<Paginated<any>> {
    const where = this.incidentsWhere(q);
    const { skip, take } = this.paginate(q.page, q.pageSize);
    const orderBy = { createdAt: q.sort === 'oldest' ? 'asc' : 'desc' } as const;
    const [raw, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          type: true,
          area: true,
          description: true,
          lat: true,
          lng: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      this.prisma.incident.count({ where }),
    ]);
    const rows = raw.map((r) => ({
      id: r.id,
      type: r.type,
      area: r.area,
      description: r.description,
      lat: r.lat,
      lng: r.lng,
      createdAt: r.createdAt,
      userName: r.user?.name ?? null,
      userEmail: r.user?.email ?? null,
    }));
    return { rows, total, page: Number(q.page) || 1, pageSize: take };
  }

  async incidentsCsv(q: IncidentsQueryDto = {}): Promise<string> {
    const raw = await this.prisma.incident.findMany({
      where: this.incidentsWhere(q),
      orderBy: { createdAt: q.sort === 'oldest' ? 'asc' : 'desc' },
      select: {
        type: true,
        area: true,
        description: true,
        lat: true,
        lng: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    });
    const flat = raw.map((r) => ({
      type: r.type,
      area: r.area ?? '',
      description: r.description ?? '',
      lat: r.lat ?? '',
      lng: r.lng ?? '',
      reporter: r.user?.name ?? '',
      email: r.user?.email ?? '',
      when: r.createdAt,
    }));
    return this.toCsv(flat, [
      { key: 'type', label: 'Type' },
      { key: 'area', label: 'Area' },
      { key: 'description', label: 'Description' },
      { key: 'lat', label: 'Lat' },
      { key: 'lng', label: 'Lng' },
      { key: 'reporter', label: 'Reporter' },
      { key: 'email', label: 'Email' },
      { key: 'when', label: 'When' },
    ]);
  }

  // Charts (byType + 30-day byDay) honoring the same incident filters. byDay is
  // bucketed over the selected range when a from/to is given, otherwise the last
  // 30 days.
  async incidentAnalytics(q: IncidentsQueryDto = {}) {
    const where = this.incidentsWhere(q);

    const byTypeRaw = await this.prisma.incident.groupBy({
      by: ['type'],
      where,
      _count: { _all: true },
    });
    const byType = byTypeRaw.map((r) => ({ type: r.type, count: r._count._all }));

    // Determine the day window: explicit range clamped to <=90 days, else 30d.
    const rangeFilter = this.dateRange(q.from, q.to);
    const end = rangeFilter?.lte ?? new Date();
    let start = rangeFilter?.gte ?? this.daysAgo(29);
    const maxDays = 90;
    const spanDays =
      Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (spanDays > maxDays) {
      start = new Date(end.getTime() - (maxDays - 1) * 24 * 60 * 60 * 1000);
    }

    const dayWhere = { ...where, createdAt: { gte: start, lte: end } };
    const rows = await this.prisma.incident.findMany({
      where: dayWhere,
      select: { createdAt: true },
    });

    const buckets = new Map<string, number>();
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);
    while (cursor.getTime() <= endDay.getTime()) {
      buckets.set(cursor.toISOString().slice(0, 10), 0);
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const row of rows) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const byDay = Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));

    return { byType, byDay };
  }

  // Distinct type + area values for the incidents filter dropdowns.
  async incidentFilters() {
    const [types, areas] = await Promise.all([
      this.prisma.incident.findMany({
        distinct: ['type'],
        select: { type: true },
        orderBy: { type: 'asc' },
      }),
      this.prisma.incident.findMany({
        where: { area: { not: null } },
        distinct: ['area'],
        select: { area: true },
        orderBy: { area: 'asc' },
      }),
    ]);
    return {
      types: types.map((t) => t.type).filter(Boolean),
      areas: areas.map((a) => a.area).filter((a): a is string => !!a),
    };
  }

  private sosWhere(q: SosQueryDto) {
    const where: Record<string, unknown> = {};
    if (q.status) where.status = q.status;
    const started = this.dateRange(q.from, q.to);
    if (started) where.startedAt = started;
    return where;
  }

  async sos(q: SosQueryDto = {}) {
    const where = this.sosWhere(q);
    const { skip, take } = this.paginate(q.page, q.pageSize);

    const [byStatusRaw, rawRows, total, resolved] = await Promise.all([
      this.prisma.sosEvent.groupBy({ by: ['status'], where, _count: { _all: true } }),
      this.prisma.sosEvent.findMany({
        where,
        skip,
        take,
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          status: true,
          startedAt: true,
          resolvedAt: true,
          lat: true,
          lng: true,
          user: { select: { name: true } },
        },
      }),
      this.prisma.sosEvent.count({ where }),
      this.prisma.sosEvent.findMany({
        where: { ...where, status: 'RESOLVED', resolvedAt: { not: null } },
        select: { startedAt: true, resolvedAt: true },
      }),
    ]);

    const byStatus = byStatusRaw.map((r) => ({ status: r.status, count: r._count._all }));
    const rows = rawRows.map((e) => ({
      id: e.id,
      status: e.status,
      startedAt: e.startedAt,
      resolvedAt: e.resolvedAt,
      lat: e.lat,
      lng: e.lng,
      userName: e.user?.name ?? null,
      responseSec: e.resolvedAt
        ? (e.resolvedAt.getTime() - e.startedAt.getTime()) / 1000
        : null,
    }));

    const responseTimes = resolved
      .map((e) =>
        e.resolvedAt ? (e.resolvedAt.getTime() - e.startedAt.getTime()) / 1000 : null,
      )
      .filter((v): v is number => v !== null);

    let avgResponseSec: number | null = null;
    let medianResponseSec: number | null = null;
    if (responseTimes.length) {
      avgResponseSec = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const sorted = [...responseTimes].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      medianResponseSec =
        sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    return {
      byStatus,
      rows,
      total,
      page: Number(q.page) || 1,
      pageSize: take,
      avgResponseSec,
      medianResponseSec,
    };
  }

  async sosCsv(q: SosQueryDto = {}): Promise<string> {
    const raw = await this.prisma.sosEvent.findMany({
      where: this.sosWhere(q),
      orderBy: { startedAt: 'desc' },
      select: {
        status: true,
        startedAt: true,
        resolvedAt: true,
        lat: true,
        lng: true,
        user: { select: { name: true } },
      },
    });
    const flat = raw.map((e) => ({
      status: e.status,
      user: e.user?.name ?? '',
      started: e.startedAt,
      resolved: e.resolvedAt ?? '',
      responseSec:
        e.resolvedAt != null
          ? Math.round((e.resolvedAt.getTime() - e.startedAt.getTime()) / 1000)
          : '',
      lat: e.lat ?? '',
      lng: e.lng ?? '',
    }));
    return this.toCsv(flat, [
      { key: 'status', label: 'Status' },
      { key: 'user', label: 'User' },
      { key: 'started', label: 'Started' },
      { key: 'resolved', label: 'Resolved' },
      { key: 'responseSec', label: 'Response (s)' },
      { key: 'lat', label: 'Lat' },
      { key: 'lng', label: 'Lng' },
    ]);
  }

  async hotspots(q: CrimeQueryDto = {}) {
    // CrimeIncident.lat/lon are non-nullable, so no null guard is needed here.
    const crimeWhere: Record<string, unknown> = {};
    if (q.crimeType) crimeWhere.crimeType = q.crimeType;
    if (q.locality) crimeWhere.locality = { contains: q.locality, mode: 'insensitive' };
    if (q.zone) crimeWhere.zone = q.zone;
    if (q.commissionerate) crimeWhere.commissionerate = q.commissionerate;
    if (q.timeOfDay) crimeWhere.timeOfDay = q.timeOfDay;
    if (q.severityMin != null || q.severityMax != null) {
      crimeWhere.severity = {
        ...(q.severityMin != null ? { gte: q.severityMin } : {}),
        ...(q.severityMax != null ? { lte: q.severityMax } : {}),
      };
    }
    const incidentDate = this.dateRange(q.from, q.to);
    if (incidentDate) crimeWhere.incidentDate = incidentDate;

    const reportWhere: Record<string, unknown> = { lat: { not: null }, lng: { not: null } };
    const created = this.dateRange(q.from, q.to);
    if (created) reportWhere.createdAt = created;

    const [crime, reports] = await Promise.all([
      this.prisma.crimeIncident.findMany({
        where: crimeWhere,
        select: {
          id: true,
          lat: true,
          lon: true,
          severity: true,
          crimeType: true,
          locality: true,
          timeOfDay: true,
        },
      }),
      this.prisma.incident.findMany({
        where: reportWhere,
        select: { id: true, lat: true, lng: true, type: true, area: true, createdAt: true },
      }),
    ]);
    return { crime, reports };
  }

  // Distinct crime dropdown values.
  async crimeFilters() {
    const [types, localities, zones, commissionerates] = await Promise.all([
      this.prisma.crimeIncident.findMany({
        distinct: ['crimeType'],
        select: { crimeType: true },
        orderBy: { crimeType: 'asc' },
      }),
      this.prisma.crimeIncident.findMany({
        distinct: ['locality'],
        select: { locality: true },
        orderBy: { locality: 'asc' },
      }),
      this.prisma.crimeIncident.findMany({
        where: { zone: { not: null } },
        distinct: ['zone'],
        select: { zone: true },
        orderBy: { zone: 'asc' },
      }),
      this.prisma.crimeIncident.findMany({
        where: { commissionerate: { not: null } },
        distinct: ['commissionerate'],
        select: { commissionerate: true },
        orderBy: { commissionerate: 'asc' },
      }),
    ]);
    return {
      crimeTypes: types.map((t) => t.crimeType).filter(Boolean),
      localities: localities.map((l) => l.locality).filter(Boolean),
      zones: zones.map((z) => z.zone).filter((z): z is string => !!z),
      commissionerates: commissionerates
        .map((c) => c.commissionerate)
        .filter((c): c is string => !!c),
    };
  }

  async contacts(q: ContactsQueryDto = {}) {
    const guardianWhere: Record<string, unknown> = {};
    if (q.status) guardianWhere.status = q.status;
    if (q.watchMode) guardianWhere.watchMode = q.watchMode;

    const [guardianByStatusRaw, guardianByWatchModeRaw, placesByCategoryRaw] =
      await Promise.all([
        this.prisma.guardianLink.groupBy({
          by: ['status'],
          where: guardianWhere,
          _count: { _all: true },
        }),
        this.prisma.guardianLink.groupBy({
          by: ['watchMode'],
          where: guardianWhere,
          _count: { _all: true },
        }),
        this.prisma.nearbyPlace.groupBy({ by: ['category'], _count: { _all: true } }),
      ]);

    const guardianByStatus = guardianByStatusRaw.map((r) => ({
      status: r.status,
      count: r._count._all,
    }));
    const guardianByWatchMode = guardianByWatchModeRaw.map((r) => ({
      watchMode: r.watchMode,
      count: r._count._all,
    }));
    const placesByCategory = placesByCategoryRaw.map((r) => ({
      category: r.category,
      count: r._count._all,
    }));

    const helplines = [
      { label: 'Women helpline', number: '1091' },
      { label: 'Domestic abuse', number: '181' },
      { label: 'Ambulance', number: '108' },
    ];

    return { guardianByStatus, guardianByWatchMode, placesByCategory, helplines };
  }

  async health() {
    const mem = process.memoryUsage();
    const memory = {
      rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
    };

    // Never throw: a DB outage is the exact case this endpoint must report.
    let dbUp = false;
    let counts: {
      users: number | null;
      incidents: number | null;
      sos: number | null;
      crimeIncidents: number | null;
      places: number | null;
    } = { users: null, incidents: null, sos: null, crimeIncidents: null, places: null };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbUp = true;
      const [users, incidents, sos, crimeIncidents, places] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.incident.count(),
        this.prisma.sosEvent.count(),
        this.prisma.crimeIncident.count(),
        this.prisma.nearbyPlace.count(),
      ]);
      counts = { users, incidents, sos, crimeIncidents, places };
    } catch {
      dbUp = false;
      counts = { users: null, incidents: null, sos: null, crimeIncidents: null, places: null };
    }

    return {
      dbUp,
      uptimeSec: Math.round(process.uptime()),
      memory,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      counts,
    };
  }
}
