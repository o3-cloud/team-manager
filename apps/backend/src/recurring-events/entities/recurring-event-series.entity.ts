import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recurring_event_series')
export class RecurringEventSeriesEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'team_id' })
  teamId!: string;

  @Column({ name: 'season_id' })
  seasonId!: string;

  @Column({ name: 'rrule_string', type: 'text' })
  rruleString!: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
