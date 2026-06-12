import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TeamRoles } from '../common/decorators/team-roles.decorator';
import { MANAGE_TEAM_ROLES } from '../common/enums/team-role.enum';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { UserEntity } from '../users/entities/user.entity';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InvitesService } from './invites.service';

@Controller('teams/:teamId/invites')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  @TeamRoles(...MANAGE_TEAM_ROLES)
  create(
    @Param('teamId') teamId: string,
    @Body() dto: CreateInviteDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.invitesService.create(teamId, user.id, dto.role);
  }

  @Get()
  @TeamRoles(...MANAGE_TEAM_ROLES)
  findAll(@Param('teamId') teamId: string) {
    return this.invitesService.findByTeam(teamId);
  }

  @Delete(':inviteId')
  @TeamRoles(...MANAGE_TEAM_ROLES)
  revoke(
    @Param('teamId') teamId: string,
    @Param('inviteId', new ParseUUIDPipe({ version: '4' })) inviteId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.invitesService.revoke(teamId, inviteId, user.id);
  }
}

@Controller('invites')
@UseGuards(JwtAuthGuard)
export class InviteAcceptController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post(':token/accept')
  accept(@Param('token') token: string, @CurrentUser() user: UserEntity) {
    return this.invitesService.accept(token, user.id);
  }
}
