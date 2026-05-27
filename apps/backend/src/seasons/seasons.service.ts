import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateSeasonDto } from './dto/create-season.dto';
import { SeasonEntity, SeasonStatus } from './entities/season.entity';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(SeasonEntity)
    private readonly seasonRepo: Repository<SeasonEntity>,
  ) {}

  async create(teamId: string, dto: CreateSeasonDto): Promise<SeasonEntity> {
    const season = this.seasonRepo.create({
      teamId,
      name: dto.name,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: SeasonStatus.ACTIVE,
    });

    try {
      return await this.seasonRepo.save(season);
    } catch (err) {
      if (err instanceof QueryFailedError && (err as { code?: string }).code === '23505') {
        throw new ConflictException('This team already has an active season');
      }
      throw err;
    }
  }

  findByTeam(teamId: string): Promise<SeasonEntity[]> {
    return this.seasonRepo.findBy({ teamId });
  }

  async archive(teamId: string, seasonId: string): Promise<SeasonEntity> {
    const season = await this.seasonRepo.findOneBy({ id: seasonId, teamId });
    if (!season) throw new NotFoundException('Season not found');
    if (season.status === SeasonStatus.ARCHIVED) return season;

    season.status = SeasonStatus.ARCHIVED;
    return this.seasonRepo.save(season);
  }
}
