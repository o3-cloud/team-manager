import * as crypto from 'node:crypto';
import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { TeamRole } from '../common/enums/team-role.enum';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { InviteCreatedDto } from './dto/invite-created.dto';
import { InvitePublicDto } from './dto/invite-public.dto';
import { InviteEntity, InviteStatus } from './entities/invite.entity';

const INVITE_TTL_HOURS = 72;

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(InviteEntity)
    private readonly inviteRepo: Repository<InviteEntity>,
    @InjectRepository(MembershipEntity)
    private readonly membershipRepo: Repository<MembershipEntity>,
  ) {}

  async create(teamId: string, createdBy: string, role: TeamRole): Promise<InviteCreatedDto> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000);

    const invite = this.inviteRepo.create({ teamId, createdBy, role, tokenHash, expiresAt });
    const saved = await this.inviteRepo.save(invite);
    return InviteCreatedDto.fromWithToken(saved, rawToken);
  }

  async accept(rawToken: string, userId: string): Promise<MembershipEntity> {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const invite = await this.inviteRepo.findOneBy({ tokenHash });
    if (!invite) throw new NotFoundException('Invite not found');

    if (invite.status !== InviteStatus.PENDING) {
      throw new GoneException('Invite has already been used or revoked');
    }
    if (invite.expiresAt < new Date()) {
      throw new GoneException('Invite has expired');
    }

    const existing = await this.membershipRepo.findOneBy({ teamId: invite.teamId, userId });
    if (existing) throw new ConflictException('Already a member of this team');

    invite.status = InviteStatus.ACCEPTED;
    invite.acceptedBy = userId;
    await this.inviteRepo.save(invite);

    const membership = this.membershipRepo.create({
      teamId: invite.teamId,
      userId,
      role: invite.role,
    });

    try {
      return await this.membershipRepo.save(membership);
    } catch (err) {
      if (err instanceof QueryFailedError && (err as { code?: string }).code === '23505') {
        throw new ConflictException('Already a member of this team');
      }
      throw err;
    }
  }

  async revoke(teamId: string, inviteId: string, actorId: string): Promise<InvitePublicDto> {
    const invite = await this.inviteRepo.findOneBy({ id: inviteId, teamId });
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.createdBy !== actorId) {
      const membership = await this.membershipRepo.findOneBy({ teamId, userId: actorId });
      if (!membership || !['COACH', 'ASSISTANT_COACH', 'TEAM_MANAGER'].includes(membership.role)) {
        throw new ForbiddenException('Cannot revoke this invite');
      }
    }
    if (invite.status === InviteStatus.REVOKED) {
      return InvitePublicDto.from(invite);
    }
    if (invite.status !== InviteStatus.PENDING) {
      throw new ConflictException('Invite is not pending');
    }

    invite.status = InviteStatus.REVOKED;
    return InvitePublicDto.from(await this.inviteRepo.save(invite));
  }

  async findByTeam(teamId: string): Promise<InvitePublicDto[]> {
    const invites = await this.inviteRepo.findBy({ teamId });
    return invites.map(InvitePublicDto.from);
  }
}
