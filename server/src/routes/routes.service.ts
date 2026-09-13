import { Injectable, BadGatewayException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanRouteDto } from './dto/plan-route.dto';

// Crime-exposure weighting — ported verbatim from the sakhi_model Python planner
// (sakhi/route_osrm.py). Exposure of a route = integral over its length of
// nearby-incident risk:
//   exposure = Σ_segments len(seg) · Σ_incidents sev_i · exp(-(d/DECAY_R)^2)
// with severity up-weighted for night-sensitive crimes when time = 'night'.
const DECAY_R = 500; // metres — Gaussian bandwidth of an incident's influence
const CUTOFF = 1200; // metres — ignore incidents farther than this
const NIGHT_SENSITIVE = new Set([
  'sexual_offence',
  'robbery',
  'assault',
  'homicide',
]);

export type LatLng = [number, number]; // [lat, lon]

export interface ScoredRoute {
  coords: LatLng[];
  length_m: number;
  duration_s: number;
  exposure: number;
  kind: string;
}

export interface IncidentPoint {
  lat: number;
  lon: number;
  sev: number;
  type: string;
}

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  private haversine(la1: number, lo1: number, la2: number, lo2: number): number {
    const R = 6371000; // metres
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(la2 - la1);
    const dLon = toRad(lo2 - lo1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  /** Where to reach OSRM. Self-hosted (foot profile) if OSRM_URL is set;
   *  otherwise the public demo, which only supports the driving profile. */
  private osrmTarget(): { base: string; profile: string } {
    const url = process.env.OSRM_URL?.replace(/\/$/, '');
    if (url) return { base: url, profile: 'foot' };
    return { base: 'https://router.project-osrm.org', profile: 'driving' };
  }

  private async fetchRoutes(a: LatLng, b: LatLng): Promise<Omit<ScoredRoute, 'exposure' | 'kind'>[]> {
    const { base, profile } = this.osrmTarget();
    const url =
      `${base}/route/v1/${profile}/${a[1]},${a[0]};${b[1]},${b[0]}` +
      `?overview=full&geometries=geojson&alternatives=3&steps=false`;

    let data: any;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      data = await res.json();
    } catch (e) {
      throw new BadGatewayException(
        `Could not reach OSRM at ${base}. Is the router running? (${(e as Error).message})`,
      );
    }
    if (data?.code !== 'Ok') {
      throw new BadGatewayException(`OSRM: ${data?.code} ${data?.message ?? ''}`.trim());
    }
    return (data.routes as any[]).map((rt) => ({
      // GeoJSON is [lon, lat] — flip to [lat, lon].
      coords: rt.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as LatLng),
      length_m: Math.round(rt.distance),
      duration_s: Math.round(rt.duration),
    }));
  }

  /** Exposure integral (risk · metres) along the route. */
  private scoreRoute(coords: LatLng[], incidents: IncidentPoint[], time: 'day' | 'night'): number {
    if (!incidents.length) return 0;
    let exposure = 0;
    for (let k = 0; k < coords.length - 1; k++) {
      const [la1, lo1] = coords[k];
      const [la2, lo2] = coords[k + 1];
      const seg = this.haversine(la1, lo1, la2, lo2);
      const mlat = (la1 + la2) / 2;
      const mlon = (lo1 + lo2) / 2;
      let risk = 0;
      for (const inc of incidents) {
        const d = this.haversine(mlat, mlon, inc.lat, inc.lon);
        if (d > CUTOFF) continue;
        let sev = inc.sev;
        if (time === 'night') {
          sev *= NIGHT_SENSITIVE.has(inc.type) ? 1.6 : 0.8;
        }
        risk += sev * Math.exp(-((d / DECAY_R) ** 2));
      }
      exposure += risk * seg;
    }
    return Math.round(exposure * 10) / 10;
  }

  /**
   * Forward-geocode a place name to coordinates via OpenStreetMap Nominatim,
   * biased to the Hyderabad area (matches the crime data + local OSRM graph).
   * Proxied through the backend so we control the required User-Agent and can
   * swap in a self-hosted Nominatim later.
   */
  async geocode(q: string): Promise<{ name: string; lat: number; lng: number }[]> {
    const query = (q ?? '').trim();
    if (query.length < 3) return [];
    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      limit: '6',
      countrycodes: 'in',
      bounded: '1',
      // viewbox = left,top,right,bottom (minlon,maxlat,maxlon,minlat) ≈ Hyderabad.
      viewbox: '78.10,17.65,78.80,17.15',
    });
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Sakhi/1.0 (women-safety college project)' },
        signal: AbortSignal.timeout(15000),
      });
      const data = (await res.json()) as any[];
      return data.map((d) => ({
        name: d.display_name as string,
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon),
      }));
    } catch (e) {
      throw new BadGatewayException(
        `Geocoding failed (${(e as Error).message}). Try again or drop a pin on the map.`,
      );
    }
  }

  /** All geocoded crime incidents, for the risk-zones map/heatmap. */
  listIncidents() {
    return this.prisma.crimeIncident.findMany({
      orderBy: { incidentDate: 'desc' },
      select: {
        id: true,
        crimeType: true,
        locality: true,
        severity: true,
        timeOfDay: true,
        lat: true,
        lon: true,
        incidentDate: true,
      },
    });
  }

  async plan(dto: PlanRouteDto) {
    const time: 'day' | 'night' = dto.time ?? 'day';
    const a: LatLng = [dto.from.lat, dto.from.lng];
    const b: LatLng = [dto.to.lat, dto.to.lng];

    const rows = await this.prisma.crimeIncident.findMany({
      select: { lat: true, lon: true, severity: true, crimeType: true },
    });
    const incidents: IncidentPoint[] = rows.map((r) => ({
      lat: r.lat,
      lon: r.lon,
      sev: r.severity,
      type: r.crimeType,
    }));

    const base = await this.fetchRoutes(a, b);
    const routes: ScoredRoute[] = base.map((rt) => ({
      ...rt,
      exposure: this.scoreRoute(rt.coords, incidents, time),
      kind: '',
    }));

    // Rank: lowest exposure first, shorter as tiebreak.
    routes.sort((x, y) => x.exposure - y.exposure || x.length_m - y.length_m);
    routes.forEach((rt, i) => {
      rt.kind = i === 0 ? 'safest' : `alt${i}`;
    });
    // Tag the shortest route too, for the "safer but longer" comparison.
    if (routes.length) {
      const shortest = routes.reduce((s, r) => (r.length_m < s.length_m ? r : s), routes[0]);
      if (shortest !== routes[0]) shortest.kind += '+shortest';
    }

    const { base: osrmBase, profile } = this.osrmTarget();
    return {
      src: a,
      dst: b,
      time,
      engine: `OSRM/${profile}${osrmBase.includes('project-osrm.org') ? ' (public demo)' : ''}`,
      routes,
      incidents,
    };
  }
}
