import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('season_records')
export class SeasonRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'season_id' })
  seasonId!: string;

  @Column({ type: 'int', default: 0 })
  wins!: number;

  @Column({ type: 'int', default: 0 })
  losses!: number;

  @Column({ type: 'int', default: 0 })
  ties!: number;
}
