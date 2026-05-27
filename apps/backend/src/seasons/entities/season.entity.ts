import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum SeasonStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

@Entity('seasons')
export class SeasonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ type: 'enum', enum: SeasonStatus, default: SeasonStatus.ACTIVE })
  status: SeasonStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
