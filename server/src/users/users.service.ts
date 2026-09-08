import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async setPushToken(userId: string, expoPushToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken },
    });
    return { ok: true };
  }
}
