import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteGuardianDto, UpdateGuardianDto } from './dto/invite-guardian.dto';

@Injectable()
export class GuardiansService {
  constructor(private readonly prisma: PrismaService) {}

  /** Guardians the owner has added to their circle. */
  async list(ownerId: string) {
    return this.prisma.guardianLink.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'asc' },
      include: { guardian: { select: { id: true, name: true, email: true } } },
    });
  }

  /** Circles that this user has been invited to watch over. */
  async watching(guardianUserId: string) {
    return this.prisma.guardianLink.findMany({
      where: { guardianUserId },
      orderBy: { createdAt: 'asc' },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
  }

  async invite(ownerId: string, dto: InviteGuardianDto) {
    // If the invitee already has an account, link them immediately.
    const invitee = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.contact }, { phone: dto.contact }] },
    });
    return this.prisma.guardianLink.create({
      data: {
        ownerId,
        name: dto.name,
        inviteeContact: dto.contact,
        guardianUserId: invitee?.id ?? null,
        status: dto.watchMode ?? 'PENDING',
      },
    });
  }

  async updateStatus(ownerId: string, linkId: string, dto: UpdateGuardianDto) {
    const link = await this.prisma.guardianLink.findUnique({ where: { id: linkId } });
    if (!link) throw new NotFoundException('Guardian not found');
    if (link.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.guardianLink.update({
      where: { id: linkId },
      data: { status: dto.status },
    });
  }

  /** A guardian accepts or declines an invite to watch over someone. */
  async respond(guardianUserId: string, linkId: string, accept: boolean) {
    const link = await this.prisma.guardianLink.findUnique({ where: { id: linkId } });
    if (!link) throw new NotFoundException('Invite not found');
    if (link.guardianUserId !== guardianUserId) throw new ForbiddenException();
    return this.prisma.guardianLink.update({
      where: { id: linkId },
      data: { status: accept ? 'ACTIVE' : 'DECLINED' },
    });
  }

  async remove(ownerId: string, linkId: string) {
    const link = await this.prisma.guardianLink.findUnique({ where: { id: linkId } });
    if (!link) throw new NotFoundException('Guardian not found');
    if (link.ownerId !== ownerId) throw new ForbiddenException();
    await this.prisma.guardianLink.delete({ where: { id: linkId } });
    return { ok: true };
  }

  /**
   * User IDs of the owner's guardians who should receive live updates.
   * ACTIVE guardians get everything; SOS_ONLY guardians are included only when
   * `sosContext` is true (i.e. an emergency).
   */
  async getGuardianUserIds(ownerId: string, sosContext = false): Promise<string[]> {
    const statuses = sosContext ? ['ACTIVE', 'SOS_ONLY'] : ['ACTIVE'];
    const links = await this.prisma.guardianLink.findMany({
      where: { ownerId, status: { in: statuses }, guardianUserId: { not: null } },
      select: { guardianUserId: true },
    });
    return links.map((l) => l.guardianUserId).filter((id): id is string => !!id);
  }

  /** Expo push tokens for the owner's guardians (used to notify on SOS). */
  async getGuardianPushTokens(ownerId: string, sosContext = true): Promise<string[]> {
    const ids = await this.getGuardianUserIds(ownerId, sosContext);
    if (ids.length === 0) return [];
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids }, expoPushToken: { not: null } },
      select: { expoPushToken: true },
    });
    return users.map((u) => u.expoPushToken).filter((t): t is string => !!t);
  }
}
