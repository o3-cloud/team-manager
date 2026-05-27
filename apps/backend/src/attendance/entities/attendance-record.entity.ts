import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AttendanceMark {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

@Entity('attendance_records')
export class AttendanceRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'event_id' })
  eventId!: string;

  @Column({ name: 'roster_entry_id' })
  rosterEntryId!: string;

  @Column({ type: 'enum', enum: AttendanceMark, enumName: 'attendance_mark_enum' })
  mark!: AttendanceMark;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
