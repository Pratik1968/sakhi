import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InviteGuardianDto, UpdateGuardianDto } from './dto/invite-guardian.dto';

@Injectable()
export class GuardiansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

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

  /**
   * Whether the given email/phone already belongs to a Sakhi user. Used by the
   * add-guardian flow to tell the owner, before inviting, whether the contact
   * will receive an in-app request to accept (existing account) or can't be
   * reached yet (no account). Either way the invite starts PENDING. Mirrors the
   * OR-lookup that `invite` uses to link an invitee.
   */
  async lookupContact(contact: string) {
    const c = contact.trim();
    if (!c) return { exists: false, name: null };
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: c }, { phone: c }] },
      select: { name: true },
    });
    return { exists: !!user, name: user?.name ?? null };
  }

  async invite(ownerId: string, ownerName: string, dto: InviteGuardianDto) {
    // If the invitee already has an account, attach their user id so the link
    // surfaces as a request they can accept. The link always starts PENDING —
    // it only becomes active once they accept (see `respond`).
    const invitee = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.contact }, { phone: dto.contact }] },
    });
    const link = await this.prisma.guardianLink.create({
      data: {
        ownerId,
        name: dto.name,
        relationship: dto.relationship ?? null,
        inviteeContact: dto.contact,
        guardianUserId: invitee?.id ?? null,
        status: 'PENDING',
        watchMode: dto.watchMode ?? 'ACTIVE',
      },
    });

    // Notify the invitee if they're already a Sakhi user with a push token.
    // Non-users can't be reached (no SMS/email channel); they keep the link row.
    if (invitee?.expoPushToken) {
      await this.notifications.sendPush(
        [invitee.expoPushToken],
        `${ownerName} added you to their circle`,
        `You're now a guardian for ${ownerName} on Sakhi.`,
        { type: 'guardian-invite', linkId: link.id, ownerId },
      );
    }

    return link;
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

    // Decline: mark the A→B link declined, no reverse link created.
    if (!accept) {
      return this.prisma.guardianLink.update({
        where: { id: linkId },
        data: { status: 'DECLINED' },
      });
    }

    // Only a still-pending invite can be accepted — ignore re-accepts of an
    // already-resolved (ACTIVE / SOS_ONLY / DECLINED) link so the reverse-link
    // upsert doesn't run twice.
    if (link.status !== 'PENDING') return link;

    // Accept: activate the A→B link with its intended watch mode, and make the
    // relationship reciprocal by creating/activating the reverse B→A link so
    // both people are guardians of each other.
    const mode = link.watchMode; // ACTIVE | SOS_ONLY
    const bId = link.guardianUserId; // the accepting user (B)
    const aId = link.ownerId; // the original owner (A)

    const updated = await this.prisma.guardianLink.update({
      where: { id: linkId },
      data: { status: mode },
    });

    // A's user record — needed for the reverse link's display name/contact and
    // the accepted push.
    const aUser = await this.prisma.user.findUnique({ where: { id: aId } });
    // B's user record — used for the push copy sent to A.
    const bUser = await this.prisma.user.findUnique({ where: { id: bId } });

    // Upsert the reverse link (owner=B, guardian=A) without duplicating.
    const reverse = await this.prisma.guardianLink.findFirst({
      where: { ownerId: bId, guardianUserId: aId },
    });
    if (reverse) {
      await this.prisma.guardianLink.update({
        where: { id: reverse.id },
        data: { status: mode, watchMode: mode },
      });
    } else {
      await this.prisma.guardianLink.create({
        data: {
          ownerId: bId,
          guardianUserId: aId,
          name: aUser?.name ?? 'Guardian',
          relationship: null,
          inviteeContact: aUser?.email ?? aUser?.phone ?? null,
          status: mode,
          watchMode: mode,
        },
      });
    }

    // Best-effort: tell A that B accepted (only if A has a push token).
    if (aUser?.expoPushToken) {
      const bName = bUser?.name ?? 'Someone';
      await this.notifications.sendPush(
        [aUser.expoPushToken],
        `${bName} accepted your guardian request`,
        'You can now see each other on Sakhi.',
        { type: 'guardian-accepted', linkId },
      );
    }

    return updated;
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
