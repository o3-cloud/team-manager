import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() dto: CreateTeamDto, @CurrentUser() user: UserEntity) {
    return this.teamsService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: UserEntity) {
    return this.teamsService.findAllForUser(user.id);
  }

  @Get(':teamId')
  findOne(@Param('teamId') teamId: string, @CurrentUser() user: UserEntity) {
    return this.teamsService.findOne(teamId, user.id);
  }
}
