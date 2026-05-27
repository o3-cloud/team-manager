import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('parent_player_links')
export class ParentPlayerLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_user_id' })
  parentUserId: string;

  @Column({ name: 'roster_entry_id' })
  rosterEntryId: string;
}
