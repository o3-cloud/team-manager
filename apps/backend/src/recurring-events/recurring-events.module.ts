import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../events/entities/event.entity';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { SeasonEntity } from '../seasons/entities/season.entity';
import { RecurringEventSeriesEntity } from './entities/recurring-event-series.entity';
import { RecurringEventsController } from './recurring-events.controller';
import { RecurringEventsService } from './recurring-events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecurringEventSeriesEntity,
      EventEntity,
      SeasonEntity,
      MembershipEntity,
    ]),
  ],
  controllers: [RecurringEventsController],
  providers: [RecurringEventsService],
  exports: [RecurringEventsService],
})
export class RecurringEventsModule {}
