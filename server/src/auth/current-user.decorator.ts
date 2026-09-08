import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthUser = { id: string; email: string; name: string };

/** Injects the authenticated user (set by JwtStrategy.validate) into a handler. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
