import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RosterEntryStatus {
  ACTIVE = 'ACTIVE',
  INJURED = 'INJURED',
  INACTIVE = 'INACTIVE',
}

@Entity('roster_entries')
export class RosterEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @Column({ name: 'user_id', nullable: true, type: 'uuid' })
  userId: string | null;

  @Column({ name: 'display_name', length: 100 })
  displayName: string;

  @Column({ name: 'jersey_number', type: 'varchar', length: 20, nullable: true })
  jerseyNumber: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  position: string | null;

  @Column({
    type: 'enum',
    enum: RosterEntryStatus,
    enumName: 'roster_entry_status_enum',
    default: RosterEntryStatus.ACTIVE,
  })
  status!: RosterEntryStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
