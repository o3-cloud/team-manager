import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TeamRole } from '../../common/enums/team-role.enum';

@Entity('memberships')
export class MembershipEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: TeamRole })
  role: TeamRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
