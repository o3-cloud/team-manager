import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRole } from '../common/enums/team-role.enum';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementAudience, AnnouncementEntity } from './entities/announcement.entity';

export class AnnouncementPostedEvent {
  constructor(
    public readonly announcementId: string,
    public readonly teamId: string,
    public readonly targetAudience: AnnouncementAudience,
  ) {}
}

const POST_ROLES = [TeamRole.COACH, TeamRole.ASSISTANT_COACH, TeamRole.TEAM_MANAGER];

const VIEW_ALL_ROLES = [
  TeamRole.COACH,
  TeamRole.ASSISTANT_COACH,
  TeamRole.TEAM_MANAGER,
  TeamRole.SCOREKEEPER,
];

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

    const targetAudience = dto.targetAudience ?? AnnouncementAudience.ALL;

    const announcement = this.announcementRepo.create({
      teamId,
      authorId,
      title: dto.title,
      body: dto.body,
      pinned: dto.pinned ?? false,
      targetAudience,
      urgent: dto.urgent ?? false,
    });
    await this.announcementRepo.save(announcement);

    this.eventEmitter.emit(
      'announcement.posted',
      new AnnouncementPostedEvent(announcement.id, teamId, targetAudience),
    );

    return announcement;
  }

  async findByTeam(teamId: string, callerRole: TeamRole): Promise<AnnouncementEntity[]> {
    const qb = this.announcementRepo
      .createQueryBuilder('a')
      .where('a.teamId = :teamId', { teamId })
      .orderBy('a.pinned', 'DESC')
      .addOrderBy('a.createdAt', 'DESC');

    if (!VIEW_ALL_ROLES.includes(callerRole)) {
      const audiences =
        callerRole === TeamRole.PLAYER
          ? [AnnouncementAudience.ALL, AnnouncementAudience.PLAYERS]
          : [AnnouncementAudience.ALL, AnnouncementAudience.PARENTS];
      qb.andWhere('a.targetAudience IN (:...audiences)', { audiences });
    }

    return qb.getMany();
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
