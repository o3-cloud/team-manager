import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
