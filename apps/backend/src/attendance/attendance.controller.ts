import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { TeamScopedRequest } from '../common/guards/team-member.guard';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { AttendanceService } from './attendance.service';
import { UpsertAttendanceDto } from './dto/upsert-attendance.dto';

@UseGuards(JwtAuthGuard, TeamMemberGuard)
@Controller('teams/:teamId/events/:eventId/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Put()
  upsert(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Req() req: TeamScopedRequest,
    @Body() dto: UpsertAttendanceDto,
  ) {
    return this.attendanceService.upsert(teamId, eventId, req.teamRole!, dto);
  }

  @Get()
  findByEvent(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.attendanceService.findByEvent(teamId, eventId);
  }
}
