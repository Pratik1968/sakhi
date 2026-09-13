import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) throw err || new UnauthorizedException();
    const allow = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (allow.length && !allow.includes(String(user.email).toLowerCase())) {
      throw new ForbiddenException('Not an admin');
    }
    return user;
  }
}
