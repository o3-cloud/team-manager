import { TeamRole } from '../../common/enums/team-role.enum';
import { InviteEntity, InviteStatus } from '../entities/invite.entity';

export class InvitePublicDto {
  id: string;
  teamId: string;
  createdBy: string;
  role: TeamRole;
  expiresAt: Date;
  acceptedBy: string | null;
  status: InviteStatus;
  createdAt: Date;

  static from(invite: InviteEntity): InvitePublicDto {
    return {
      id: invite.id,
      teamId: invite.teamId,
      createdBy: invite.createdBy,
      role: invite.role,
      expiresAt: invite.expiresAt,
      acceptedBy: invite.acceptedBy,
      status: invite.status,
      createdAt: invite.createdAt,
    };
  }
}
