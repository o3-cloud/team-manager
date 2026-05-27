import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamRoles } from '../common/decorators/team-roles.decorator';
import { TeamRole } from '../common/enums/team-role.enum';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { CancelEventDto } from './dto/cancel-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

const WRITE_ROLES = [TeamRole.COACH, TeamRole.ASSISTANT_COACH, TeamRole.TEAM_MANAGER];

@Controller('teams/:teamId/events')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @TeamRoles(...WRITE_ROLES)
  create(
    @Param('teamId', new ParseUUIDPipe({ version: '4' })) teamId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(teamId, dto);
  }

  @Get()
  findAll(
    @Param('teamId', new ParseUUIDPipe({ version: '4' })) teamId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.eventsService.findByTeam(teamId, from, to);
  }

  @Get(':eventId')
  findOne(
    @Param('teamId', new ParseUUIDPipe({ version: '4' })) teamId: string,
    @Param('eventId', new ParseUUIDPipe({ version: '4' })) eventId: string,
  ) {
    return this.eventsService.findOne(teamId, eventId);
  }

  @Patch(':eventId')
  @TeamRoles(...WRITE_ROLES)
  update(
    @Param('teamId', new ParseUUIDPipe({ version: '4' })) teamId: string,
    @Param('eventId', new ParseUUIDPipe({ version: '4' })) eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(teamId, eventId, dto);
  }

  @Delete(':eventId')
  @TeamRoles(...WRITE_ROLES)
  remove(
    @Param('teamId', new ParseUUIDPipe({ version: '4' })) teamId: string,
    @Param('eventId', new ParseUUIDPipe({ version: '4' })) eventId: string,
  ) {
    return this.eventsService.remove(teamId, eventId);
  }

  @Post(':eventId/cancel')
  @TeamRoles(...WRITE_ROLES)
  cancel(
    @Param('teamId', new ParseUUIDPipe({ version: '4' })) teamId: string,
    @Param('eventId', new ParseUUIDPipe({ version: '4' })) eventId: string,
    @Body() dto: CancelEventDto,
  ) {
    return this.eventsService.cancel(teamId, eventId, dto);
  }

  @Post(':eventId/reinstate')
  @TeamRoles(...WRITE_ROLES)
  reinstate(
    @Param('teamId', new ParseUUIDPipe({ version: '4' })) teamId: string,
    @Param('eventId', new ParseUUIDPipe({ version: '4' })) eventId: string,
    @Body('version', ParseIntPipe) version: number,
  ) {
    return this.eventsService.reinstate(teamId, eventId, version);
  }
}
