import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../events/entities/event.entity';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { RosterEntryEntity } from '../roster/entities/roster-entry.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceRecordEntity,
      EventEntity,
      RosterEntryEntity,
      MembershipEntity,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
