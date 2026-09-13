import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private daysAgo(days: number): Date {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  async summary() {
    const since7d = this.daysAgo(7);
    const [
      totalUsers,
      newUsers7d,
      totalIncidents,
      incidents7d,
      activeSos,
      totalSos,
      guardiansActive,
      guardiansPending,
      evidence,
      places,
      crimeIncidents,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: since7d } } }),
      this.prisma.incident.count(),
      this.prisma.incident.count({ where: { createdAt: { gte: since7d } } }),
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
      newUsers7d,
      totalIncidents,
      incidents7d,
      activeSos,
      totalSos,
      guardiansActive,
      guardiansPending,
      evidence,
      places,
      crimeIncidents,
    };
  }

  users(limit = 100) {
    const take = Math.max(1, Math.min(500, Number(limit) || 100));
    return this.prisma.user.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { incidents: true, sosEvents: true, guardianLinks: true },
        },
      },
    });
  }

  async incidentAnalytics() {
    const byTypeRaw = await this.prisma.incident.groupBy({
      by: ['type'],
      _count: { _all: true },
    });
    const byType = byTypeRaw.map((r) => ({ type: r.type, count: r._count._all }));

    const since30d = this.daysAgo(30);
    const rows = await this.prisma.incident.findMany({
      where: { createdAt: { gte: since30d } },
      select: { createdAt: true },
    });

    // Build last-30-day daily buckets (oldest -> newest), zero-filled.
    const buckets = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = this.daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }
    for (const row of rows) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const byDay = Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));

    const recent = await this.prisma.incident.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: { id: true, type: true, area: true, createdAt: true },
    });

    return { byType, byDay, recent };
  }

  async hotspots() {
    const [crime, reports] = await Promise.all([
      this.prisma.crimeIncident.findMany({
        select: { id: true, lat: true, lon: true, severity: true, crimeType: true, locality: true },
      }),
      this.prisma.incident.findMany({
        where: { lat: { not: null }, lng: { not: null } },
        select: { id: true, lat: true, lng: true, type: true, area: true, createdAt: true },
      }),
    ]);
    return { crime, reports };
  }

  async sos() {
    const byStatusRaw = await this.prisma.sosEvent.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const byStatus = byStatusRaw.map((r) => ({ status: r.status, count: r._count._all }));

    const recentRaw = await this.prisma.sosEvent.findMany({
      take: 30,
      orderBy: { startedAt: 'desc' },
      select: { id: true, status: true, startedAt: true, resolvedAt: true, lat: true, lng: true },
    });
    const recent = recentRaw.map((e) => ({
      ...e,
      responseSec: e.resolvedAt
        ? (e.resolvedAt.getTime() - e.startedAt.getTime()) / 1000
        : null,
    }));

    // Avg/median computed over ALL resolved events, not just the recent slice.
    const resolved = await this.prisma.sosEvent.findMany({
      where: { status: 'RESOLVED', resolvedAt: { not: null } },
      select: { startedAt: true, resolvedAt: true },
    });
    const responseTimes = resolved
      .map((e) =>
        e.resolvedAt ? (e.resolvedAt.getTime() - e.startedAt.getTime()) / 1000 : null,
      )
      .filter((v): v is number => v !== null);

    let avgResponseSec: number | null = null;
    let medianResponseSec: number | null = null;
    if (responseTimes.length) {
      avgResponseSec =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const sorted = [...responseTimes].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      medianResponseSec =
        sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    return { byStatus, recent, avgResponseSec, medianResponseSec };
  }

  async contacts() {
    const [guardianByStatusRaw, guardianByWatchModeRaw, placesByCategoryRaw] =
      await Promise.all([
        this.prisma.guardianLink.groupBy({ by: ['status'], _count: { _all: true } }),
        this.prisma.guardianLink.groupBy({ by: ['watchMode'], _count: { _all: true } }),
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
