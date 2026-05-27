import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { SeasonEntity, SeasonStatus } from '../seasons/entities/season.entity';
import { CancelEventDto } from './dto/cancel-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity, EventStatus } from './entities/event.entity';

export class EventUpdatedEvent {
  constructor(
    public readonly event: EventEntity,
    public readonly teamId: string,
  ) {}
}
export class EventCancelledEvent {
  constructor(
    public readonly event: EventEntity,
    public readonly teamId: string,
  ) {}
}
export class EventReinstatedEvent {
  constructor(
    public readonly event: EventEntity,
    public readonly teamId: string,
  ) {}
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(SeasonEntity)
    private readonly seasonRepo: Repository<SeasonEntity>,
    private readonly emitter: EventEmitter2,
  ) {}

  async create(
    teamId: string,
    dto: CreateEventDto,
  ): Promise<EventEntity & { warnings?: string[] }> {
    const season = await this.seasonRepo.findOneBy({ teamId, status: SeasonStatus.ACTIVE });
    if (!season) {
      throw new UnprocessableEntityException('No active season for this team');
    }

    const event = this.eventRepo.create({
      teamId,
      seasonId: season.id,
      title: dto.title,
      type: dto.type,
      startsAt: new Date(dto.startsAt),
      location: dto.location ?? null,
      notes: dto.notes ?? null,
      status: EventStatus.SCHEDULED,
      version: 0,
    });

    const saved = await this.eventRepo.save(event);
    const warnings = await this.checkOverlap(teamId, saved.id, saved.startsAt);
    return Object.assign(saved, warnings.length ? { warnings } : {});
  }

  async findByTeam(teamId: string, from?: string, to?: string): Promise<EventEntity[]> {
    if (from && to) {
      return this.eventRepo.find({
        where: { teamId, startsAt: Between(new Date(from), new Date(to)) },
        order: { startsAt: 'ASC' },
      });
    }
    return this.eventRepo.find({ where: { teamId }, order: { startsAt: 'ASC' } });
  }

  async findOne(teamId: string, eventId: string): Promise<EventEntity> {
    const event = await this.eventRepo.findOneBy({ id: eventId, teamId });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(
    teamId: string,
    eventId: string,
    dto: UpdateEventDto,
  ): Promise<EventEntity & { warnings?: string[] }> {
    const event = await this.findOne(teamId, eventId);
    if (event.status === EventStatus.CANCELLED) {
      throw new UnprocessableEntityException('Cannot edit a cancelled event');
    }
    if (event.version !== dto.version) {
      throw new ConflictException('Stale version — please refresh and retry');
    }

    if (dto.title !== undefined) event.title = dto.title;
    if (dto.type !== undefined) event.type = dto.type;
    if (dto.startsAt !== undefined) event.startsAt = new Date(dto.startsAt);
    if (dto.location !== undefined) event.location = dto.location ?? null;
    if (dto.notes !== undefined) event.notes = dto.notes ?? null;
    event.version += 1;

    const saved = await this.eventRepo.save(event);
    this.emitter.emit('event.updated', new EventUpdatedEvent(saved, teamId));
    const warnings = await this.checkOverlap(teamId, saved.id, saved.startsAt);
    return Object.assign(saved, warnings.length ? { warnings } : {});
  }

  async remove(teamId: string, eventId: string): Promise<void> {
    const event = await this.findOne(teamId, eventId);
    await this.eventRepo.remove(event);
  }

  async cancel(teamId: string, eventId: string, dto: CancelEventDto): Promise<EventEntity> {
    const event = await this.findOne(teamId, eventId);
    if (event.status === EventStatus.CANCELLED) {
      throw new UnprocessableEntityException('Event is already cancelled');
    }
    if (event.version !== dto.version) {
      throw new ConflictException('Stale version — please refresh and retry');
    }

    event.status = EventStatus.CANCELLED;
    event.cancelReason = dto.reason ?? null;
    event.version += 1;

    const saved = await this.eventRepo.save(event);
    this.emitter.emit('event.cancelled', new EventCancelledEvent(saved, teamId));
    return saved;
  }

  async reinstate(teamId: string, eventId: string, version: number): Promise<EventEntity> {
    const event = await this.findOne(teamId, eventId);
    if (event.status !== EventStatus.CANCELLED) {
      throw new UnprocessableEntityException('Event is not cancelled');
    }
    if (event.startsAt <= new Date()) {
      throw new UnprocessableEntityException(
        'Cannot reinstate an event whose start time has passed',
      );
    }
    if (event.version !== version) {
      throw new ConflictException('Stale version — please refresh and retry');
    }

    event.status = EventStatus.SCHEDULED;
    event.cancelReason = null;
    event.version += 1;

    const saved = await this.eventRepo.save(event);
    this.emitter.emit('event.reinstated', new EventReinstatedEvent(saved, teamId));
    return saved;
  }

  private async checkOverlap(teamId: string, excludeId: string, startsAt: Date): Promise<string[]> {
    const windowMs = 60 * 60 * 1000; // 1 hour window
    const from = new Date(startsAt.getTime() - windowMs);
    const to = new Date(startsAt.getTime() + windowMs);
    const overlapping = await this.eventRepo.find({
      where: { teamId, startsAt: Between(from, to), status: EventStatus.SCHEDULED },
    });
    const conflicts = overlapping.filter((e) => e.id !== excludeId);
    return conflicts.length
      ? [`Overlaps with ${conflicts.length} other event(s) within 1 hour`]
      : [];
  }
}
