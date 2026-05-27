import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MANAGE_TEAM_ROLES, TeamRole } from '../common/enums/team-role.enum';
import { MembershipEntity } from './entities/membership.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(MembershipEntity)
    private readonly membershipRepo: Repository<MembershipEntity>,
  ) {}

  async findByTeam(teamId: string): Promise<MembershipEntity[]> {
    return this.membershipRepo.findBy({ teamId });
  }

  async updateRole(
    teamId: string,
    targetUserId: string,
    newRole: TeamRole,
    actorRole: TeamRole,
    actorUserId: string,
  ): Promise<MembershipEntity> {
    if (!MANAGE_TEAM_ROLES.includes(actorRole)) {
      throw new ForbiddenException('Only coaches can update member roles');
    }

    // Prevent a coach from demoting themselves — would lock the team out of management
    if (actorUserId === targetUserId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const membership = await this.membershipRepo.findOneBy({ teamId, userId: targetUserId });
    if (!membership) throw new NotFoundException('Member not found in this team');

    membership.role = newRole;
    return this.membershipRepo.save(membership);
  }
}
