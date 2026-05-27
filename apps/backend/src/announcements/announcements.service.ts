import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRole } from '../common/enums/team-role.enum';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementEntity } from './entities/announcement.entity';

export class AnnouncementPostedEvent {
  constructor(
    public readonly announcementId: string,
    public readonly teamId: string,
  ) {}
}

const POST_ROLES = [TeamRole.COACH, TeamRole.ASSISTANT_COACH, TeamRole.TEAM_MANAGER];

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(AnnouncementEntity)
    private readonly announcementRepo: Repository<AnnouncementEntity>,
    @InjectRepository(MembershipEntity)
    private readonly membershipRepo: Repository<MembershipEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    teamId: string,
    authorId: string,
    actorRole: TeamRole,
    dto: CreateAnnouncementDto,
  ): Promise<AnnouncementEntity> {
    if (!POST_ROLES.includes(actorRole)) {
      throw new ForbiddenException('Insufficient role to post announcements');
    }

    const announcement = this.announcementRepo.create({
      teamId,
      authorId,
      title: dto.title,
      body: dto.body,
      pinned: dto.pinned ?? false,
    });
    await this.announcementRepo.save(announcement);

    this.eventEmitter.emit(
      'announcement.posted',
      new AnnouncementPostedEvent(announcement.id, teamId),
    );

    return announcement;
  }

  async findByTeam(teamId: string): Promise<AnnouncementEntity[]> {
    return this.announcementRepo.find({
      where: { teamId },
      order: { pinned: 'DESC', createdAt: 'DESC' },
    });
  }

  async delete(teamId: string, id: string, actorRole: TeamRole): Promise<void> {
    if (!POST_ROLES.includes(actorRole)) {
      throw new ForbiddenException('Insufficient role to delete announcements');
    }
    const announcement = await this.announcementRepo.findOneBy({ id, teamId });
    if (!announcement) throw new NotFoundException('Announcement not found');
    await this.announcementRepo.remove(announcement);
  }
}
