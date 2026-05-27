import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamRoles } from '../common/decorators/team-roles.decorator';
import { TeamRole } from '../common/enums/team-role.enum';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { CreateRecurringEventDto } from './dto/create-recurring-event.dto';
import { RecurringEventsService } from './recurring-events.service';

const WRITE_ROLES = [TeamRole.COACH, TeamRole.ASSISTANT_COACH, TeamRole.TEAM_MANAGER];

@Controller('teams/:teamId/recurring-events')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class RecurringEventsController {
  constructor(private readonly svc: RecurringEventsService) {}

  @Post()
  @TeamRoles(...WRITE_ROLES)
  createSeries(
    @Param('teamId', new ParseUUIDPipe({ version: '4' })) teamId: string,
    @Body() dto: CreateRecurringEventDto,
  ) {
    return this.svc.createSeries(teamId, dto);
  }

  @Get()
  findAll(@Param('teamId', new ParseUUIDPipe({ version: '4' })) teamId: string) {
    return this.svc.findSeriesByTeam(teamId);
  }

  @Post(':seriesId/cancel')
  @TeamRoles(...WRITE_ROLES)
  cancelSeries(
    @Param('teamId', new ParseUUIDPipe({ version: '4' })) teamId: string,
    @Param('seriesId', new ParseUUIDPipe({ version: '4' })) seriesId: string,
  ) {
    return this.svc.cancelSeries(teamId, seriesId);
  }
}
