import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RRule } from 'rrule';
import { Repository } from 'typeorm';
import { EventEntity, EventStatus } from '../events/entities/event.entity';
import { SeasonEntity, SeasonStatus } from '../seasons/entities/season.entity';
import { CreateRecurringEventDto } from './dto/create-recurring-event.dto';
import { RecurringEventSeriesEntity } from './entities/recurring-event-series.entity';

const MAX_SERIES_YEARS = 2;
const MAX_INSTANCES = 365;

@Injectable()
export class RecurringEventsService {
  constructor(
    @InjectRepository(RecurringEventSeriesEntity)
    private readonly seriesRepo: Repository<RecurringEventSeriesEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(SeasonEntity)
    private readonly seasonRepo: Repository<SeasonEntity>,
  ) {}

  async createSeries(
    teamId: string,
    dto: CreateRecurringEventDto,
  ): Promise<{ series: RecurringEventSeriesEntity; instances: EventEntity[] }> {
    const season = await this.seasonRepo.findOneBy({ teamId, status: SeasonStatus.ACTIVE });
    if (!season) {
      throw new UnprocessableEntityException('No active season for this team');
    }

    const endDate = new Date(dto.endDate);
    const maxEnd = new Date();
    maxEnd.setFullYear(maxEnd.getFullYear() + MAX_SERIES_YEARS);
    if (endDate > maxEnd) {
      throw new BadRequestException(
        `Series end date cannot exceed ${MAX_SERIES_YEARS} years from today`,
      );
    }

    const firstStart = new Date(dto.firstStartsAt);

    let rule: RRule;
    try {
      const parsed = RRule.parseString(dto.rruleString);
      rule = new RRule({ ...parsed, dtstart: firstStart });
    } catch {
      throw new BadRequestException('Invalid rrule string');
    }

    const occurrences = rule.between(firstStart, endDate, true).slice(0, MAX_INSTANCES);
    if (occurrences.length === 0) {
      throw new BadRequestException('rrule produces no occurrences within the given date range');
    }

    const series = this.seriesRepo.create({
      teamId,
      seasonId: season.id,
      rruleString: dto.rruleString,
      endDate: dto.endDate,
    });
    const savedSeries = await this.seriesRepo.save(series);

    const instances = occurrences.map((startsAt) =>
      this.eventRepo.create({
        teamId,
        seasonId: season.id,
        seriesId: savedSeries.id,
        title: dto.title,
        type: dto.type,
        startsAt,
        status: EventStatus.SCHEDULED,
        version: 0,
      }),
    );

    const savedInstances = await this.eventRepo.save(instances);
    return { series: savedSeries, instances: savedInstances };
  }

  async cancelInstance(teamId: string, eventId: string): Promise<EventEntity> {
    const event = await this.eventRepo.findOneBy({ id: eventId, teamId });
    if (!event) throw new NotFoundException('Event not found');
    if (!event.seriesId) throw new BadRequestException('Event is not part of a series');
    if (event.status === EventStatus.CANCELLED) {
      throw new UnprocessableEntityException('Event is already cancelled');
    }

    event.status = EventStatus.CANCELLED;
    event.version += 1;
    return this.eventRepo.save(event);
  }

  async cancelSeries(teamId: string, seriesId: string): Promise<void> {
    const series = await this.seriesRepo.findOneBy({ id: seriesId, teamId });
    if (!series) throw new NotFoundException('Series not found');

    const futures = await this.eventRepo.find({
      where: { seriesId, teamId, status: EventStatus.SCHEDULED },
    });
    const now = new Date();
    const toCancel = futures.filter((e) => e.startsAt > now);
    for (const ev of toCancel) {
      ev.status = EventStatus.CANCELLED;
      ev.version += 1;
    }
    if (toCancel.length) await this.eventRepo.save(toCancel);
  }

  findSeriesByTeam(teamId: string): Promise<RecurringEventSeriesEntity[]> {
    return this.seriesRepo.findBy({ teamId });
  }
}
