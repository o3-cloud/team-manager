import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
