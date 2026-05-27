import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard, TeamScopedRequest } from '../common/guards/team-member.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard, TeamMemberGuard)
@Controller('teams/:teamId/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Param('teamId', ParseUUIDPipe) teamId: string, @Req() req: TeamScopedRequest) {
    return this.notificationsService.findForUser(req.user.id, teamId);
  }

  @Patch(':id/read')
  markRead(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: TeamScopedRequest,
  ) {
    return this.notificationsService.markRead(req.user.id, teamId, id);
  }

  @Patch('read-all')
  @HttpCode(204)
  markAllRead(@Param('teamId', ParseUUIDPipe) teamId: string, @Req() req: TeamScopedRequest) {
    return this.notificationsService.markAllRead(req.user.id, teamId);
  }
}
