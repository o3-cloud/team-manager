import { IsEnum } from 'class-validator';
import { TeamRole } from '../../common/enums/team-role.enum';

export class CreateInviteDto {
  @IsEnum(TeamRole)
  role: TeamRole;
}
