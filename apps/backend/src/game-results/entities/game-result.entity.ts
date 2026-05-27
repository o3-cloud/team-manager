import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GameOutcome {
  WIN = 'WIN',
  LOSS = 'LOSS',
  TIE = 'TIE',
}

@Entity('game_results')
export class GameResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'event_id' })
  eventId!: string;

  @Column({ name: 'season_id' })
  seasonId!: string;

  @Column({ name: 'own_score', type: 'int' })
  ownScore!: number;

  @Column({ name: 'opp_score', type: 'int' })
  oppScore!: number;

  @Column({ type: 'enum', enum: GameOutcome, enumName: 'game_outcome_enum' })
  outcome!: GameOutcome;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
