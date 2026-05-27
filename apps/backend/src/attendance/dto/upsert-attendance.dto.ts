import { IsEnum, IsUUID } from 'class-validator';
import { AttendanceMark } from '../entities/attendance-record.entity';

export class UpsertAttendanceDto {
  @IsUUID('4')
  rosterEntryId!: string;

  @IsEnum(AttendanceMark)
  mark!: AttendanceMark;
}
