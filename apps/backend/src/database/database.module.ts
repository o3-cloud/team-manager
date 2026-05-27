import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementEntity } from '../announcements/entities/announcement.entity';
import { AttendanceRecordEntity } from '../attendance/entities/attendance-record.entity';
import { EventEntity } from '../events/entities/event.entity';
import { GameResultEntity } from '../game-results/entities/game-result.entity';
import { SeasonRecordEntity } from '../game-results/entities/season-record.entity';
import { InviteEntity } from '../invites/entities/invite.entity';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { NotificationEntity } from '../notifications/entities/notification.entity';
import { RecurringEventSeriesEntity } from '../recurring-events/entities/recurring-event-series.entity';
import { ParentPlayerLinkEntity } from '../roster/entities/parent-player-link.entity';
import { RosterEntryEntity } from '../roster/entities/roster-entry.entity';
import { RsvpEntity } from '../rsvp/entities/rsvp.entity';
import { SeasonEntity } from '../seasons/entities/season.entity';
import { TeamEntity } from '../teams/entities/team.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        entities: [
          UserEntity,
          TeamEntity,
          MembershipEntity,
          SeasonEntity,
          InviteEntity,
          RosterEntryEntity,
          ParentPlayerLinkEntity,
          EventEntity,
          RecurringEventSeriesEntity,
          RsvpEntity,
          AttendanceRecordEntity,
          GameResultEntity,
          SeasonRecordEntity,
          AnnouncementEntity,
          NotificationEntity,
        ],
        synchronize: false,
        migrationsRun: true,
        migrations: [__dirname + '/../migrations/*.{ts,js}'],
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
