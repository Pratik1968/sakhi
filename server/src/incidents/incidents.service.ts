import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateIncidentDto) {
    return this.prisma.incident.create({
      data: {
        userId,
        type: dto.type,
        area: dto.area,
        description: dto.description,
        lat: dto.lat,
        lng: dto.lng,
      },
    });
  }

  list(userId: string) {
    return this.prisma.incident.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { evidence: true },
    });
  }

  /**
   * Nearby community reports (all users), for the "warn the women behind you"
   * feature. Returns recent incidents with coordinates, without owner identity.
   */
  nearby() {
    return this.prisma.incident.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, type: true, lat: true, lng: true, createdAt: true },
    });
  }
}
