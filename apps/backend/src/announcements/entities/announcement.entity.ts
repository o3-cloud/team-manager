import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AnnouncementAudience {
  ALL = 'ALL',
  PLAYERS = 'PLAYERS',
  PARENTS = 'PARENTS',
}

@Entity('announcements')
export class AnnouncementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'team_id' })
  teamId!: string;

  @Column({ name: 'author_id' })
  authorId!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'pinned', type: 'boolean', default: false })
  pinned!: boolean;

  @Column({
    name: 'target_audience',
    type: 'enum',
    enum: AnnouncementAudience,
    enumName: 'announcement_audience_enum',
    default: AnnouncementAudience.ALL,
  })
  targetAudience!: AnnouncementAudience;

  @Column({ name: 'urgent', type: 'boolean', default: false })
  urgent!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
