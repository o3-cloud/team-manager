import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipEntity } from '../../memberships/entities/membership.entity';
import type { UserEntity } from '../../users/entities/user.entity';
import { TEAM_ROLES_KEY } from '../decorators/team-roles.decorator';
import type { TeamRole } from '../enums/team-role.enum';

export interface TeamScopedRequest {
  user: UserEntity;
  teamRole?: TeamRole;
  membership?: MembershipEntity;
  params: Record<string, string>;
}

@Injectable()
export class TeamMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(MembershipEntity)
    private readonly membershipRepo: Repository<MembershipEntity>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<TeamScopedRequest>();
    const teamId = req.params?.teamId;

    // Non-team-scoped routes pass through
    if (!teamId) return true;

    const membership = await this.membershipRepo.findOneBy({
      userId: req.user.id,
      teamId,
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this team');
    }

    req.teamRole = membership.role;
    req.membership = membership;

    const requiredRoles = this.reflector.getAllAndOverride<TeamRole[]>(TEAM_ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (requiredRoles?.length && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient role for this action');
    }

    return true;
  }
}
