import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRole } from '../common/enums/team-role.enum';
import { EventEntity, EventStatus } from '../events/entities/event.entity';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { ParentPlayerLinkEntity } from '../roster/entities/parent-player-link.entity';
import { UpsertRsvpDto } from './dto/upsert-rsvp.dto';
import { RsvpEntity } from './entities/rsvp.entity';

@Injectable()
export class RsvpService {
  constructor(
    @InjectRepository(RsvpEntity)
    private readonly rsvpRepo: Repository<RsvpEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(MembershipEntity)
    private readonly membershipRepo: Repository<MembershipEntity>,
    @InjectRepository(ParentPlayerLinkEntity)
    private readonly linkRepo: Repository<ParentPlayerLinkEntity>,
  ) {}

  async upsert(
    teamId: string,
    eventId: string,
    actorUserId: string,
    dto: UpsertRsvpDto,
  ): Promise<RsvpEntity> {
    const event = await this.eventRepo.findOneBy({ id: eventId, teamId });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status === EventStatus.CANCELLED) {
      throw new UnprocessableEntityException('Cannot RSVP to a cancelled event');
    }

    let targetUserId = actorUserId;

    if (dto.onBehalfOfUserId && dto.onBehalfOfUserId !== actorUserId) {
      const membership = await this.membershipRepo.findOneBy({ teamId, userId: actorUserId });
      if (!membership || membership.role !== TeamRole.PARENT) {
        throw new ForbiddenException('Only parents may RSVP on behalf of another user');
      }
      const link = await this.linkRepo.findOneBy({ parentUserId: actorUserId });
      if (!link) {
        throw new ForbiddenException('No parent-player link found for this user');
      }
      targetUserId = dto.onBehalfOfUserId;
    }

    const existing = await this.rsvpRepo.findOneBy({ eventId, userId: targetUserId });
    if (existing) {
      existing.status = dto.status;
      return this.rsvpRepo.save(existing);
    }

    const rsvp = this.rsvpRepo.create({ eventId, userId: targetUserId, status: dto.status });
    return this.rsvpRepo.save(rsvp);
  }

  async findByEvent(
    teamId: string,
    eventId: string,
  ): Promise<{ rsvps: RsvpEntity[]; nonRespondents: string[] }> {
    const event = await this.eventRepo.findOneBy({ id: eventId, teamId });
    if (!event) throw new NotFoundException('Event not found');

    const [rsvps, memberships] = await Promise.all([
      this.rsvpRepo.findBy({ eventId }),
      this.membershipRepo.findBy({ teamId }),
    ]);

    const respondedIds = new Set(rsvps.map((r) => r.userId));
    const nonRespondents = memberships
      .filter((m) => !respondedIds.has(m.userId))
      .map((m) => m.userId);

    return { rsvps, nonRespondents };
  }
}
