import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { TeamRole } from '../common/enums/team-role.enum';
import { TeamsService } from './teams.service';

describe('TeamsService BDR rules', () => {
  const teamRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    findByIds: jest.fn(),
  };
  const membershipRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findBy: jest.fn(),
    findOneBy: jest.fn(),
  };
  let service: TeamsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TeamsService(teamRepo as never, membershipRepo as never);
  });

  it('rejects a whitespace-only team name before persistence', async () => {
    await expect(service.create({ name: '   ' }, { id: 'user-1' } as never)).rejects.toThrow(
      BadRequestException,
    );
    expect(teamRepo.save).not.toHaveBeenCalled();
  });

  it('maps the database uniqueness violation to a conflict', async () => {
    teamRepo.create.mockReturnValue({ id: 'team-1', ownerId: 'user-1', name: 'U12 Red' });
    const error = new QueryFailedError('insert', [], new Error('duplicate')) as QueryFailedError & {
      code?: string;
    };
    error.code = '23505';
    teamRepo.save.mockRejectedValue(error);

    await expect(service.create({ name: 'U12 Red' }, { id: 'user-1' } as never)).rejects.toThrow(
      ConflictException,
    );
    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it('creates the owner membership with coach role', async () => {
    const team = { id: 'team-1', ownerId: 'user-1', name: ' U12 Red ' };
    teamRepo.create.mockReturnValue(team);
    teamRepo.save.mockResolvedValue(team);
    membershipRepo.create.mockReturnValue({});

    await service.create({ name: ' U12 Red ' }, { id: 'user-1' } as never);

    expect(teamRepo.create).toHaveBeenCalledWith({ ownerId: 'user-1', name: 'U12 Red' });
    expect(membershipRepo.create).toHaveBeenCalledWith({
      teamId: 'team-1',
      userId: 'user-1',
      role: TeamRole.COACH,
    });
  });

  it('denies team reads to non-members', async () => {
    teamRepo.findOneBy.mockResolvedValue({ id: 'team-1' });
    membershipRepo.findOneBy.mockResolvedValue(null);

    await expect(service.findOne('team-1', 'outsider')).rejects.toThrow(ForbiddenException);
  });
});
