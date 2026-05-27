import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RsvpStatus {
  GOING = 'GOING',
  NOT_GOING = 'NOT_GOING',
  MAYBE = 'MAYBE',
}

@Entity('rsvp')
export class RsvpEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'event_id' })
  eventId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: RsvpStatus, enumName: 'rsvp_status_enum' })
  status!: RsvpStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
