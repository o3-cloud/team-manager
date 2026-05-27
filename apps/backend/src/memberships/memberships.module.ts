import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { MembershipEntity } from './entities/membership.entity';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipEntity])],
  controllers: [MembershipsController],
  providers: [MembershipsService, TeamMemberGuard],
  exports: [MembershipsService, TeamMemberGuard],
})
export class MembershipsModule {}
