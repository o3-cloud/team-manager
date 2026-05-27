import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamRoles } from '../common/decorators/team-roles.decorator';
import { WRITE_ROSTER_ROLES } from '../common/enums/team-role.enum';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { CreateRosterEntryDto } from './dto/create-roster-entry.dto';
import { LinkParentDto } from './dto/link-parent.dto';
import { UpdateRosterEntryDto } from './dto/update-roster-entry.dto';
import { RosterService } from './roster.service';

@Controller('teams/:teamId/roster')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}

  @Post()
  @TeamRoles(...WRITE_ROSTER_ROLES)
  addPlayer(@Param('teamId') teamId: string, @Body() dto: CreateRosterEntryDto) {
    return this.rosterService.addPlayer(teamId, dto);
  }

  @Get()
  findAll(@Param('teamId') teamId: string) {
    return this.rosterService.findByTeam(teamId);
  }

  @Patch(':entryId')
  @TeamRoles(...WRITE_ROSTER_ROLES)
  update(
    @Param('teamId') teamId: string,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateRosterEntryDto,
  ) {
    return this.rosterService.updateEntry(teamId, entryId, dto);
  }

  @Post(':entryId/parents')
  @TeamRoles(...WRITE_ROSTER_ROLES)
  linkParent(
    @Param('teamId') teamId: string,
    @Param('entryId') entryId: string,
    @Body() dto: LinkParentDto,
  ) {
    return this.rosterService.linkParent(teamId, entryId, dto.parentUserId);
  }
}
