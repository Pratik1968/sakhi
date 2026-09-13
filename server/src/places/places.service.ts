import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  // Copied verbatim from routes.service.ts (returns metres).
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

  /**
   * Nearby-help places for the given point, nearest-first. Optionally filtered
   * to one category (police | hospital | support). Reads only the seeded
   * NearbyPlace table — never hits Overpass at request time.
   */
  async nearby(lat: number, lng: number, category?: string) {
    const places = await this.prisma.nearbyPlace.findMany({
      where: category ? { category } : {},
    });
    return places
      .map((p) => ({ ...p, distanceM: this.haversine(lat, lng, p.lat, p.lng) }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 50);
  }
}
