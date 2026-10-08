import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { TeamRole } from '../common/enums/team-role.enum';
import { EventStatus, EventType } from '../events/entities/event.entity';
import { GameOutcome } from './entities/game-result.entity';
import { GameResultsService } from './game-results.service';

describe('GameResultsService BDR rules', () => {
  const gameResultRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
  };
  const seasonRecordRepo = { findOneBy: jest.fn(), create: jest.fn(), save: jest.fn() };
  const eventRepo = { findOneBy: jest.fn() };
  const seasonRepo = { findOneBy: jest.fn() };
  const attendanceRepo = {};
  let service: GameResultsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GameResultsService(
      gameResultRepo as never,
      seasonRecordRepo as never,
      eventRepo as never,
      seasonRepo as never,
      attendanceRepo as never,
    );
  });

  it('rejects players from recording results', async () => {
    await expect(
      service.record('team-1', 'event-1', TeamRole.PLAYER, {
        seasonId: 'season-1',
        ownScore: 2,
        oppScore: 1,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(eventRepo.findOneBy).not.toHaveBeenCalled();
  });

  it('rejects results for non-game events', async () => {
    eventRepo.findOneBy.mockResolvedValue({
      type: EventType.PRACTICE,
      status: EventStatus.SCHEDULED,
    });

    await expect(
      service.record('team-1', 'event-1', TeamRole.COACH, {
        seasonId: 'season-1',
        ownScore: 2,
        oppScore: 1,
      }),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(seasonRepo.findOneBy).not.toHaveBeenCalled();
  });

  it('derives a win and increments the matching season record', async () => {
    const result = { eventId: 'event-1', outcome: GameOutcome.WIN };
    eventRepo.findOneBy.mockResolvedValue({ type: EventType.GAME, status: EventStatus.SCHEDULED });
    seasonRepo.findOneBy.mockResolvedValue({ id: 'season-1', teamId: 'team-1' });
    gameResultRepo.findOneBy.mockResolvedValue(null);
    gameResultRepo.create.mockReturnValue(result);
    gameResultRepo.save.mockResolvedValue(result);
    seasonRecordRepo.findOneBy.mockResolvedValue({
      seasonId: 'season-1',
      wins: 1,
      losses: 0,
      ties: 0,
    });

    await expect(
      service.record('team-1', 'event-1', TeamRole.COACH, {
        seasonId: 'season-1',
        ownScore: 3,
        oppScore: 1,
      }),
    ).resolves.toBe(result);
    expect(result.outcome).toBe(GameOutcome.WIN);
    expect(seasonRecordRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ wins: 2, losses: 0, ties: 0 }),
    );
  });

  it('rejects results for cancelled events', async () => {
    eventRepo.findOneBy.mockResolvedValue({ type: EventType.GAME, status: EventStatus.CANCELLED });

    await expect(
      service.record('team-1', 'event-1', TeamRole.COACH, {
        seasonId: 'season-1',
        ownScore: 0,
        oppScore: 0,
      }),
    ).rejects.toThrow(UnprocessableEntityException);
  });
});
