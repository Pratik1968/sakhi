import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../realtime/events.gateway';
import { GuardiansService } from '../guardians/guardians.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StartSosDto } from './dto/sos.dto';

@Injectable()
export class SosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: EventsGateway,
    private readonly guardians: GuardiansService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Raise an SOS: persist it, broadcast to guardians in realtime, and push. */
  async start(userId: string, userName: string, dto: StartSosDto) {
    const event = await this.prisma.sosEvent.create({
      data: { userId, status: 'ACTIVE', lat: dto.lat, lng: dto.lng, note: dto.note },
    });

    const payload = {
      id: event.id,
      userId,
      name: userName,
      lat: event.lat,
      lng: event.lng,
      note: event.note,
      startedAt: event.startedAt,
    };

    const guardianIds = await this.guardians.getGuardianUserIds(userId, true);
    this.gateway.emitToUsers(guardianIds, 'sos:new', payload);

    const tokens = await this.guardians.getGuardianPushTokens(userId, true);
    await this.notifications.sendPush(
      tokens,
      `🚨 ${userName} needs help`,
      'Tap to see their live location.',
      { type: 'sos', sosId: event.id, userId },
    );

    return event;
  }

  async resolve(userId: string, id: string, status: 'RESOLVED' | 'CANCELLED') {
    const event = await this.prisma.sosEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('SOS not found');
    if (event.userId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.sosEvent.update({
      where: { id },
      data: { status, resolvedAt: new Date() },
    });

    const guardianIds = await this.guardians.getGuardianUserIds(userId, true);
    this.gateway.emitToUsers(guardianIds, 'sos:resolved', { id, userId, status });

    return updated;
  }

  /** The caller's own SOS history (most recent first). */
  async mine(userId: string) {
    return this.prisma.sosEvent.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });
  }

  /** Active SOS events raised by people this user is a guardian of. */
  async feed(guardianUserId: string) {
    const links = await this.prisma.guardianLink.findMany({
      where: { guardianUserId, status: { in: ['ACTIVE', 'SOS_ONLY'] } },
      select: { ownerId: true },
    });
    const ownerIds = links.map((l) => l.ownerId);
    if (ownerIds.length === 0) return [];
    return this.prisma.sosEvent.findMany({
      where: { userId: { in: ownerIds }, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
  }
}
