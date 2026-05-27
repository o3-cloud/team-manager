import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum NotificationType {
  EVENT_UPDATED = 'EVENT_UPDATED',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
  EVENT_REINSTATED = 'EVENT_REINSTATED',
  ANNOUNCEMENT_POSTED = 'ANNOUNCEMENT_POSTED',
}

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'team_id' })
  teamId!: string;

  @Column({ type: 'enum', enum: NotificationType, enumName: 'notification_type_enum' })
  type!: NotificationType;

  @Column({ name: 'ref_id', type: 'uuid', nullable: true })
  refId!: string | null;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
