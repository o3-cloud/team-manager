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
import { UserEntity } from '../users/entities/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamEntity } from './entities/team.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
    @InjectRepository(MembershipEntity)
    private readonly membershipRepo: Repository<MembershipEntity>,
  ) {}

  async create(dto: CreateTeamDto, owner: UserEntity): Promise<TeamEntity> {
    const name = dto.name.trim();
    if (!name) throw new ConflictException('Team name cannot be blank');

    const team = this.teamRepo.create({ ownerId: owner.id, name });

    try {
      await this.teamRepo.save(team);
    } catch (err) {
      if (err instanceof QueryFailedError && (err as { code?: string }).code === '23505') {
        throw new ConflictException('A team with that name already exists for this user');
      }
      throw err;
    }

    const membership = this.membershipRepo.create({
      teamId: team.id,
      userId: owner.id,
      role: TeamRole.COACH,
    });
    await this.membershipRepo.save(membership);

    return team;
  }

  async findAllForUser(userId: string): Promise<TeamEntity[]> {
    const memberships = await this.membershipRepo.findBy({ userId });
    if (!memberships.length) return [];
    const teamIds = memberships.map((m) => m.teamId);
    return this.teamRepo.findByIds(teamIds);
  }

  async findOne(teamId: string, userId: string): Promise<TeamEntity> {
    const membership = await this.membershipRepo.findOneBy({ teamId, userId });
    if (!membership) throw new ForbiddenException('Not a member of this team');

    const team = await this.teamRepo.findOneBy({ id: teamId });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }
}
