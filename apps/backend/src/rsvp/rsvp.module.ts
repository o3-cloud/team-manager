import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../events/entities/event.entity';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { ParentPlayerLinkEntity } from '../roster/entities/parent-player-link.entity';
import { RsvpEntity } from './entities/rsvp.entity';
import { RsvpController } from './rsvp.controller';
import { RsvpService } from './rsvp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RsvpEntity, EventEntity, MembershipEntity, ParentPlayerLinkEntity]),
  ],
  controllers: [RsvpController],
  providers: [RsvpService],
  exports: [RsvpService],
})
export class RsvpModule {}
