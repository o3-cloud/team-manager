import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { SeasonEntity } from './entities/season.entity';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './seasons.service';

@Module({
  imports: [TypeOrmModule.forFeature([SeasonEntity, MembershipEntity])],
  controllers: [SeasonsController],
  providers: [SeasonsService, TeamMemberGuard],
  exports: [SeasonsService],
})
export class SeasonsModule {}
