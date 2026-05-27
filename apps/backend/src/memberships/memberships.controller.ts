import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TeamRoles } from '../common/decorators/team-roles.decorator';
import { MANAGE_TEAM_ROLES } from '../common/enums/team-role.enum';
import type { TeamScopedRequest } from '../common/guards/team-member.guard';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { UserEntity } from '../users/entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { MembershipsService } from './memberships.service';

@Controller('teams/:teamId/members')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  findAll(@Param('teamId') teamId: string) {
    return this.membershipsService.findByTeam(teamId);
  }

  @Patch(':userId/role')
  @TeamRoles(...MANAGE_TEAM_ROLES)
  updateRole(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: Request & TeamScopedRequest,
    @CurrentUser() actor: UserEntity,
  ) {
    return this.membershipsService.updateRole(teamId, userId, dto.role, req.teamRole!, actor.id);
  }
}
