import { ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamRole } from '../common/enums/team-role.enum';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { AnnouncementPostedEvent, AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementAudience, AnnouncementEntity } from './entities/announcement.entity';

const makeQb = (rows: Partial<AnnouncementEntity>[] = []) => {
  const qb = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  };
  return qb;
};

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let announcementRepo: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOneBy: jest.Mock;
    remove: jest.Mock;
  };
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    announcementRepo = {
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: getRepositoryToken(AnnouncementEntity), useValue: announcementRepo },
        { provide: getRepositoryToken(MembershipEntity), useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get(AnnouncementsService);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('findByTeam — audience filtering', () => {
    it('does not apply andWhere for COACH (sees all)', async () => {
      const qb = makeQb([]);
      announcementRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findByTeam('team-1', TeamRole.COACH);

      expect(qb.andWhere).not.toHaveBeenCalled();
    });

    it('does not apply andWhere for SCOREKEEPER (sees all)', async () => {
      const qb = makeQb([]);
      announcementRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findByTeam('team-1', TeamRole.SCOREKEEPER);

      expect(qb.andWhere).not.toHaveBeenCalled();
    });

    it('applies andWhere with ALL+PLAYERS for PLAYER role', async () => {
      const qb = makeQb([]);
      announcementRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findByTeam('team-1', TeamRole.PLAYER);

      expect(qb.andWhere).toHaveBeenCalledWith('a.targetAudience IN (:...audiences)', {
        audiences: [AnnouncementAudience.ALL, AnnouncementAudience.PLAYERS],
      });
    });

    it('applies andWhere with ALL+PARENTS for PARENT role', async () => {
      const qb = makeQb([]);
      announcementRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findByTeam('team-1', TeamRole.PARENT);

      expect(qb.andWhere).toHaveBeenCalledWith('a.targetAudience IN (:...audiences)', {
        audiences: [AnnouncementAudience.ALL, AnnouncementAudience.PARENTS],
      });
    });
  });

  describe('create', () => {
    it('defaults targetAudience to ALL and urgent to false when omitted', async () => {
      const saved = {
        id: 'ann-1',
        teamId: 'team-1',
        authorId: 'user-1',
        title: 'Hello',
        body: 'World',
        pinned: false,
        targetAudience: AnnouncementAudience.ALL,
        urgent: false,
        createdAt: new Date(),
      };
      announcementRepo.create.mockReturnValue(saved);
      announcementRepo.save.mockResolvedValue(saved);

      const dto: CreateAnnouncementDto = { title: 'Hello', body: 'World' };
      const result = await service.create('team-1', 'user-1', TeamRole.COACH, dto);

      expect(result.targetAudience).toBe(AnnouncementAudience.ALL);
      expect(result.urgent).toBe(false);
    });

    it('emits AnnouncementPostedEvent with targetAudience', async () => {
      const saved = {
        id: 'ann-2',
        teamId: 'team-1',
        authorId: 'user-1',
        title: 'Alert',
        body: 'Players only',
        pinned: false,
        targetAudience: AnnouncementAudience.PLAYERS,
        urgent: true,
        createdAt: new Date(),
      };
      announcementRepo.create.mockReturnValue(saved);
      announcementRepo.save.mockResolvedValue(saved);

      const dto: CreateAnnouncementDto = {
        title: 'Alert',
        body: 'Players only',
        targetAudience: AnnouncementAudience.PLAYERS,
        urgent: true,
      };
      await service.create('team-1', 'user-1', TeamRole.COACH, dto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'announcement.posted',
        expect.objectContaining({
          targetAudience: AnnouncementAudience.PLAYERS,
          teamId: 'team-1',
          announcementId: 'ann-2',
        }),
      );
    });

    it('throws ForbiddenException for PLAYER role', async () => {
      const dto: CreateAnnouncementDto = { title: 'Unauthorized', body: 'Nope' };
      await expect(service.create('team-1', 'user-1', TeamRole.PLAYER, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
