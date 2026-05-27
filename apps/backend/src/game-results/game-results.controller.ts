import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard, TeamScopedRequest } from '../common/guards/team-member.guard';
import { RecordGameResultDto } from './dto/record-game-result.dto';
import { UpdateGameResultDto } from './dto/update-game-result.dto';
import { GameResultsService } from './game-results.service';

@UseGuards(JwtAuthGuard, TeamMemberGuard)
@Controller('teams/:teamId')
export class GameResultsController {
  constructor(private readonly gameResultsService: GameResultsService) {}

  @Post('events/:eventId/game-result')
  record(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Req() req: TeamScopedRequest,
    @Body() dto: RecordGameResultDto,
  ) {
    return this.gameResultsService.record(teamId, eventId, req.teamRole!, dto);
  }

  @Patch('events/:eventId/game-result')
  update(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Req() req: TeamScopedRequest,
    @Body() dto: UpdateGameResultDto,
  ) {
    return this.gameResultsService.update(teamId, eventId, req.teamRole!, dto);
  }

  @Get('events/:eventId/game-result')
  findByEvent(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.gameResultsService.findByEvent(teamId, eventId);
  }

  @Get('seasons/:seasonId/record')
  findSeasonRecord(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('seasonId', ParseUUIDPipe) seasonId: string,
  ) {
    return this.gameResultsService.findSeasonRecord(teamId, seasonId);
  }
}
