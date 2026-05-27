import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { ParentPlayerLinkEntity } from './entities/parent-player-link.entity';
import { RosterEntryEntity } from './entities/roster-entry.entity';
import { RosterController } from './roster.controller';
import { RosterService } from './roster.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RosterEntryEntity, ParentPlayerLinkEntity, MembershipEntity]),
  ],
  controllers: [RosterController],
  providers: [RosterService, TeamMemberGuard],
  exports: [RosterService],
})
export class RosterModule {}
