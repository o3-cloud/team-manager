import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamRole } from '../common/enums/team-role.enum';
import { MembershipEntity } from './entities/membership.entity';
import { MembershipsService } from './memberships.service';

const mockMembership = (overrides: Partial<MembershipEntity> = {}): MembershipEntity =>
  ({
    id: 'mem-1',
    teamId: 'team-1',
    userId: 'user-target',
    role: TeamRole.PLAYER,
    createdAt: new Date(),
    ...overrides,
  }) as MembershipEntity;

describe('MembershipsService', () => {
  let service: MembershipsService;
  let repo: { findBy: jest.Mock; findOneBy: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repo = {
      findBy: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        MembershipsService,
        { provide: getRepositoryToken(MembershipEntity), useValue: repo },
      ],
    }).compile();

    service = module.get(MembershipsService);
  });

  describe('updateRole', () => {
    it('updates role when actor is COACH targeting a different user', async () => {
      const membership = mockMembership();
      repo.findOneBy.mockResolvedValue(membership);
      repo.save.mockImplementation((m: MembershipEntity) => Promise.resolve(m));

      const result = await service.updateRole(
        'team-1',
        'user-target',
        TeamRole.PARENT,
        TeamRole.COACH,
        'user-actor',
      );

      expect(result.role).toBe(TeamRole.PARENT);
    });

    it('throws ForbiddenException when actor is not COACH', async () => {
      await expect(
        service.updateRole('team-1', 'user-target', TeamRole.PARENT, TeamRole.PLAYER, 'user-actor'),
      ).rejects.toThrow(ForbiddenException);
    });

    // R02 — self-demotion guard
    it('throws ForbiddenException when actor targets themselves', async () => {
      await expect(
        service.updateRole('team-1', 'user-actor', TeamRole.PLAYER, TeamRole.COACH, 'user-actor'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when target member does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateRole('team-1', 'user-target', TeamRole.PLAYER, TeamRole.COACH, 'user-actor'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
