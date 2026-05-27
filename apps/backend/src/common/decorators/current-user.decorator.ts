import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { UserEntity } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest<{ user: UserEntity }>();
    return request.user;
  },
);
