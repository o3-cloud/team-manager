import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { TeamRole } from '../common/enums/team-role.enum';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { CreateRosterEntryDto } from './dto/create-roster-entry.dto';
import { UpdateRosterEntryDto } from './dto/update-roster-entry.dto';
import { ParentPlayerLinkEntity } from './entities/parent-player-link.entity';
import { RosterEntryEntity } from './entities/roster-entry.entity';

@Injectable()
export class RosterService {
  constructor(
    @InjectRepository(RosterEntryEntity)
    private readonly rosterRepo: Repository<RosterEntryEntity>,
    @InjectRepository(ParentPlayerLinkEntity)
    private readonly linkRepo: Repository<ParentPlayerLinkEntity>,
    @InjectRepository(MembershipEntity)
    private readonly membershipRepo: Repository<MembershipEntity>,
  ) {}

  async addPlayer(teamId: string, dto: CreateRosterEntryDto): Promise<RosterEntryEntity> {
    const entry = this.rosterRepo.create({
      teamId,
      displayName: dto.displayName,
      jerseyNumber: dto.jerseyNumber ?? null,
      position: dto.position ?? null,
      userId: dto.userId ?? null,
    });

    try {
      return await this.rosterRepo.save(entry);
    } catch (err) {
      if (err instanceof QueryFailedError && (err as { code?: string }).code === '23505') {
        throw new ConflictException('This player is already on the roster');
      }
      throw err;
    }
  }

  findByTeam(teamId: string): Promise<RosterEntryEntity[]> {
    return this.rosterRepo.findBy({ teamId });
  }

  async updateEntry(
    teamId: string,
    entryId: string,
    dto: UpdateRosterEntryDto,
  ): Promise<RosterEntryEntity> {
    const entry = await this.rosterRepo.findOneBy({ id: entryId, teamId });
    if (!entry) throw new NotFoundException('Roster entry not found');

    if (dto.displayName !== undefined) entry.displayName = dto.displayName;
    if (dto.jerseyNumber !== undefined) entry.jerseyNumber = dto.jerseyNumber;
    if (dto.position !== undefined) entry.position = dto.position;
    if (dto.userId !== undefined) entry.userId = dto.userId;

    return this.rosterRepo.save(entry);
  }

  findLinkedPlayers(
    teamId: string,
    parentUserId: string,
  ): Promise<{ id: string; displayName: string; userId: string | null }[]> {
    return this.linkRepo
      .createQueryBuilder('l')
      .select('re.id', 'id')
      .addSelect('re.displayName', 'displayName')
      .addSelect('re.userId', 'userId')
      .innerJoin(RosterEntryEntity, 're', 're.id = l.rosterEntryId AND re.teamId = :teamId', {
        teamId,
      })
      .where('l.parentUserId = :parentUserId', { parentUserId })
      .getRawMany<{ id: string; displayName: string; userId: string | null }>();
  }

  async linkParent(
    teamId: string,
    entryId: string,
    parentUserId: string,
  ): Promise<ParentPlayerLinkEntity> {
    const entry = await this.rosterRepo.findOneBy({ id: entryId, teamId });
    if (!entry) throw new NotFoundException('Roster entry not found');

    // Parent must be a PARENT-role member of this team (R08 mitigation)
    const parentMembership = await this.membershipRepo.findOneBy({ teamId, userId: parentUserId });
    if (!parentMembership || parentMembership.role !== TeamRole.PARENT) {
      throw new ForbiddenException(
        'User must be a PARENT member of this team before being linked to a player',
      );
    }

    const link = this.linkRepo.create({ parentUserId, rosterEntryId: entryId });

    try {
      return await this.linkRepo.save(link);
    } catch (err) {
      if (err instanceof QueryFailedError && (err as { code?: string }).code === '23505') {
        throw new ConflictException('Parent is already linked to this player');
      }
      throw err;
    }
  }
}
