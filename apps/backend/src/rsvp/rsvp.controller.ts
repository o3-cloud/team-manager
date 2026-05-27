import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import type { UserEntity } from '../users/entities/user.entity';
import { UpsertRsvpDto } from './dto/upsert-rsvp.dto';
import { RsvpService } from './rsvp.service';

interface AuthRequest extends Request {
  user: UserEntity;
}

@UseGuards(JwtAuthGuard, TeamMemberGuard)
@Controller('teams/:teamId/events/:eventId/rsvp')
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  @Put()
  upsert(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Req() req: AuthRequest,
    @Body() dto: UpsertRsvpDto,
  ) {
    return this.rsvpService.upsert(teamId, eventId, req.user.id, dto);
  }

  @Get()
  findByEvent(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.rsvpService.findByEvent(teamId, eventId);
  }
}
