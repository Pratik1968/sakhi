import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
      },
    });

    // If someone invited this email as a guardian, link the pending invite(s).
    await this.linkPendingInvites(user.id, user.email, user.phone);

    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, expoPushToken: true, createdAt: true },
    });
    return user;
  }

  private async linkPendingInvites(userId: string, email: string, phone: string | null) {
    const contacts = [email, phone].filter(Boolean) as string[];
    if (contacts.length === 0) return;
    await this.prisma.guardianLink.updateMany({
      where: { guardianUserId: null, inviteeContact: { in: contacts } },
      data: { guardianUserId: userId },
    });
  }

  private async buildAuthResponse(id: string, email: string, name: string) {
    const token = await this.jwt.signAsync({ sub: id, email });
    return { token, user: { id, email, name } };
  }
}
