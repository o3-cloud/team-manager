import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamRoles } from '../common/decorators/team-roles.decorator';
import { WRITE_EVENT_ROLES } from '../common/enums/team-role.enum';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { CreateSeasonDto } from './dto/create-season.dto';
import { SeasonsService } from './seasons.service';

@Controller('teams/:teamId/seasons')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Post()
  @TeamRoles(...WRITE_EVENT_ROLES)
  create(@Param('teamId') teamId: string, @Body() dto: CreateSeasonDto) {
    return this.seasonsService.create(teamId, dto);
  }

  @Get()
  findAll(@Param('teamId') teamId: string) {
    return this.seasonsService.findByTeam(teamId);
  }

  @Patch(':seasonId/archive')
  @TeamRoles(...WRITE_EVENT_ROLES)
  archive(@Param('teamId') teamId: string, @Param('seasonId') seasonId: string) {
    return this.seasonsService.archive(teamId, seasonId);
  }
}
