import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRole } from '../common/enums/team-role.enum';
import { EventEntity, EventStatus, EventType } from '../events/entities/event.entity';
import { SeasonEntity } from '../seasons/entities/season.entity';
import { RecordGameResultDto } from './dto/record-game-result.dto';
import { UpdateGameResultDto } from './dto/update-game-result.dto';
import { GameOutcome, GameResultEntity } from './entities/game-result.entity';
import { SeasonRecordEntity } from './entities/season-record.entity';

const RECORD_ROLES = [
  TeamRole.COACH,
  TeamRole.ASSISTANT_COACH,
  TeamRole.TEAM_MANAGER,
  TeamRole.SCOREKEEPER,
];

function deriveOutcome(ownScore: number, oppScore: number): GameOutcome {
  if (ownScore > oppScore) return GameOutcome.WIN;
  if (ownScore < oppScore) return GameOutcome.LOSS;
  return GameOutcome.TIE;
}

function outcomeField(outcome: GameOutcome): 'wins' | 'losses' | 'ties' {
  return outcome === GameOutcome.WIN ? 'wins' : outcome === GameOutcome.LOSS ? 'losses' : 'ties';
}

@Injectable()
export class GameResultsService {
  constructor(
    @InjectRepository(GameResultEntity)
    private readonly gameResultRepo: Repository<GameResultEntity>,
    @InjectRepository(SeasonRecordEntity)
    private readonly seasonRecordRepo: Repository<SeasonRecordEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(SeasonEntity)
    private readonly seasonRepo: Repository<SeasonEntity>,
  ) {}

  async record(
    teamId: string,
    eventId: string,
    actorRole: TeamRole,
    dto: RecordGameResultDto,
  ): Promise<GameResultEntity> {
    if (!RECORD_ROLES.includes(actorRole)) {
      throw new ForbiddenException('Insufficient role to record game results');
    }

    const event = await this.eventRepo.findOneBy({ id: eventId, teamId });
    if (!event) throw new NotFoundException('Event not found');
    if (event.type !== EventType.GAME) {
      throw new UnprocessableEntityException('Game results can only be recorded for GAME events');
    }
    if (event.status === EventStatus.CANCELLED) {
      throw new UnprocessableEntityException('Cannot record results for a cancelled event');
    }

    const season = await this.seasonRepo.findOneBy({ id: dto.seasonId, teamId });
    if (!season) throw new NotFoundException('Season not found');

    const existing = await this.gameResultRepo.findOneBy({ eventId });
    if (existing) throw new ConflictException('Game result already recorded for this event');

    const outcome = deriveOutcome(dto.ownScore, dto.oppScore);
    const result = this.gameResultRepo.create({
      eventId,
      seasonId: dto.seasonId,
      ownScore: dto.ownScore,
      oppScore: dto.oppScore,
      outcome,
      notes: dto.notes ?? null,
    });
    await this.gameResultRepo.save(result);

    await this.incrementSeasonRecord(dto.seasonId, outcome);

    return result;
  }

  async update(
    teamId: string,
    eventId: string,
    actorRole: TeamRole,
    dto: UpdateGameResultDto,
  ): Promise<GameResultEntity> {
    if (!RECORD_ROLES.includes(actorRole)) {
      throw new ForbiddenException('Insufficient role to update game results');
    }

    const event = await this.eventRepo.findOneBy({ id: eventId, teamId });
    if (!event) throw new NotFoundException('Event not found');

    const existing = await this.gameResultRepo.findOneBy({ eventId });
    if (!existing) throw new NotFoundException('No game result found for this event');

    const oldOutcome = existing.outcome;

    if (dto.ownScore !== undefined) existing.ownScore = dto.ownScore;
    if (dto.oppScore !== undefined) existing.oppScore = dto.oppScore;
    if (dto.notes !== undefined) existing.notes = dto.notes;
    existing.outcome = deriveOutcome(existing.ownScore, existing.oppScore);

    if (existing.outcome !== oldOutcome) {
      await this.adjustSeasonRecord(existing.seasonId, oldOutcome, existing.outcome);
    }

    return this.gameResultRepo.save(existing);
  }

  async findByEvent(teamId: string, eventId: string): Promise<GameResultEntity | null> {
    const event = await this.eventRepo.findOneBy({ id: eventId, teamId });
    if (!event) throw new NotFoundException('Event not found');
    return this.gameResultRepo.findOneBy({ eventId });
  }

  async findSeasonRecord(teamId: string, seasonId: string): Promise<SeasonRecordEntity | null> {
    const season = await this.seasonRepo.findOneBy({ id: seasonId, teamId });
    if (!season) throw new NotFoundException('Season not found');
    return this.seasonRecordRepo.findOneBy({ seasonId });
  }

  private async incrementSeasonRecord(seasonId: string, outcome: GameOutcome): Promise<void> {
    let record = await this.seasonRecordRepo.findOneBy({ seasonId });
    if (!record) {
      record = this.seasonRecordRepo.create({ seasonId, wins: 0, losses: 0, ties: 0 });
    }
    record[outcomeField(outcome)]++;
    await this.seasonRecordRepo.save(record);
  }

  private async adjustSeasonRecord(
    seasonId: string,
    oldOutcome: GameOutcome,
    newOutcome: GameOutcome,
  ): Promise<void> {
    const record = await this.seasonRecordRepo.findOneBy({ seasonId });
    if (!record) return;
    record[outcomeField(oldOutcome)] = Math.max(0, record[outcomeField(oldOutcome)] - 1);
    record[outcomeField(newOutcome)]++;
    await this.seasonRecordRepo.save(record);
  }
}
