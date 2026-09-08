import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  create(params: {
    userId: string;
    kind: string;
    url: string;
    sosEventId?: string;
    incidentId?: string;
  }) {
    return this.prisma.evidence.create({
      data: {
        userId: params.userId,
        kind: params.kind,
        url: params.url,
        sosEventId: params.sosEventId || null,
        incidentId: params.incidentId || null,
      },
    });
  }

  list(userId: string) {
    return this.prisma.evidence.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
