import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard, TeamScopedRequest } from '../common/guards/team-member.guard';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@UseGuards(JwtAuthGuard, TeamMemberGuard)
@Controller('teams/:teamId/announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  create(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Req() req: TeamScopedRequest,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.announcementsService.create(teamId, req.user.id, req.teamRole!, dto);
  }

  @Get()
  findAll(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.announcementsService.findByTeam(teamId);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: TeamScopedRequest,
  ) {
    return this.announcementsService.delete(teamId, id, req.teamRole!);
  }
}
