import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMemberGuard } from '../common/guards/team-member.guard';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { InviteEntity } from './entities/invite.entity';
import { InviteAcceptController, InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';

@Module({
  imports: [TypeOrmModule.forFeature([InviteEntity, MembershipEntity])],
  controllers: [InvitesController, InviteAcceptController],
  providers: [InvitesService, TeamMemberGuard],
  exports: [InvitesService],
})
export class InvitesModule {}
