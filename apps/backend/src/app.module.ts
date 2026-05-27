import { MiddlewareConsumer, Module, type NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { SanitizeBodyMiddleware } from './common/middleware/sanitize-body.middleware';
import { configuration } from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { GameResultsModule } from './game-results/game-results.module';
import { HealthModule } from './health/health.module';
import { InvitesModule } from './invites/invites.module';
import { MembershipsModule } from './memberships/memberships.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecurringEventsModule } from './recurring-events/recurring-events.module';
import { RosterModule } from './roster/roster.module';
import { RsvpModule } from './rsvp/rsvp.module';
import { SeasonsModule } from './seasons/seasons.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ name: 'global', ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    TeamsModule,
    MembershipsModule,
    SeasonsModule,
    InvitesModule,
    RosterModule,
    EventsModule,
    RecurringEventsModule,
    RsvpModule,
    AttendanceModule,
    GameResultsModule,
    AnnouncementsModule,
    NotificationsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SanitizeBodyMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
