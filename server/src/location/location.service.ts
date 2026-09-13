import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../realtime/events.gateway';
import { GuardiansService } from '../guardians/guardians.service';
import { LocationPingDto } from './dto/location-ping.dto';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: EventsGateway,
    private readonly guardians: GuardiansService,
  ) {}

  /** Record a location ping and broadcast it live to the user's active guardians. */
  async ping(userId: string, userName: string, dto: LocationPingDto) {
    const ping = await this.prisma.locationPing.create({
      data: { userId, lat: dto.lat, lng: dto.lng, accuracy: dto.accuracy },
    });

    const guardianIds = await this.guardians.getGuardianUserIds(userId, false);
    this.gateway.emitToUsers(guardianIds, 'location:update', {
      userId,
      name: userName,
      lat: ping.lat,
      lng: ping.lng,
      accuracy: ping.accuracy,
      recordedAt: ping.recordedAt,
    });

    return ping;
  }

  /**
   * Latest known location for a user. Allowed for the user themselves, an active
   * guardian of that user, or the owner reading one of their own active
   * guardians' locations (mutual visibility within a circle).
   */
  async latest(requesterId: string, targetUserId: string) {
    if (requesterId !== targetUserId) {
      // requester is a guardian of target (guardian → owner direction)
      const requesterGuardsTarget = (
        await this.guardians.getGuardianUserIds(targetUserId, true)
      ).includes(requesterId);
      // target is an active guardian of requester (owner → guardian direction)
      const targetGuardsRequester = (
        await this.guardians.getGuardianUserIds(requesterId, false)
      ).includes(targetUserId);
      if (!requesterGuardsTarget && !targetGuardsRequester) {
        throw new ForbiddenException('Not permitted to view this location');
      }
    }
    return this.prisma.locationPing.findFirst({
      where: { userId: targetUserId },
      orderBy: { recordedAt: 'desc' },
    });
  }
}
