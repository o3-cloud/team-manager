import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../events/entities/event.entity';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { SeasonEntity } from '../seasons/entities/season.entity';
import { GameResultEntity } from './entities/game-result.entity';
import { SeasonRecordEntity } from './entities/season-record.entity';
import { GameResultsController } from './game-results.controller';
import { GameResultsService } from './game-results.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GameResultEntity,
      SeasonRecordEntity,
      EventEntity,
      SeasonEntity,
      MembershipEntity,
    ]),
  ],
  controllers: [GameResultsController],
  providers: [GameResultsService],
  exports: [GameResultsService],
})
export class GameResultsModule {}
