import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EventType {
  GAME = 'GAME',
  PRACTICE = 'PRACTICE',
  MEETING = 'MEETING',
  OTHER = 'OTHER',
}

export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
}

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'team_id' })
  teamId!: string;

  @Column({ name: 'season_id' })
  seasonId!: string;

  @Column({ name: 'series_id', type: 'uuid', nullable: true })
  seriesId!: string | null;

  @Column({ length: 200 })
  title!: string;

  @Column({
    type: 'enum',
    enum: EventType,
    enumName: 'event_type_enum',
    default: EventType.PRACTICE,
  })
  type!: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    enumName: 'event_status_enum',
    default: EventStatus.SCHEDULED,
  })
  status!: EventStatus;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ type: 'varchar', length: 300, nullable: true })
  location!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancelReason!: string | null;

  @Column({ type: 'int', default: 0 })
  version!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
