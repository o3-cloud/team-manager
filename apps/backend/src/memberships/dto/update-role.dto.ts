import { IsEnum } from 'class-validator';
import { TeamRole } from '../../common/enums/team-role.enum';

export class UpdateRoleDto {
  @IsEnum(TeamRole)
  role: TeamRole;
}
