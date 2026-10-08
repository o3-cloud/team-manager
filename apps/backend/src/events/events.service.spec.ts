import { ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventStatus, EventType } from './entities/event.entity';
import { EventsService } from './events.service';

describe('EventsService BDR rules', () => {
  const eventRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };
  const seasonRepo = { findOneBy: jest.fn() };
  const emitter = { emit: jest.fn() } as unknown as EventEmitter2;
  let service: EventsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventsService(eventRepo as never, seasonRepo as never, emitter);
  });

  it('rejects event creation when the team has no active season', async () => {
    seasonRepo.findOneBy.mockResolvedValue(null);

    await expect(
      service.create('team-1', {
        title: 'Practice',
        type: EventType.PRACTICE,
        startsAt: '2026-10-10T15:00:00.000Z',
      }),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(eventRepo.save).not.toHaveBeenCalled();
  });

  it('rejects stale edits and does not persist them', async () => {
    const event = { id: 'event-1', version: 2, status: EventStatus.SCHEDULED };
    eventRepo.findOneBy.mockResolvedValue(event);

    await expect(
      service.update('team-1', 'event-1', { version: 1, title: 'Changed' }),
    ).rejects.toThrow(ConflictException);
    expect(eventRepo.save).not.toHaveBeenCalled();
  });

  it('cancels an event, stores the reason, increments version, and emits an event', async () => {
    const event = {
      id: 'event-1',
      version: 0,
      status: EventStatus.SCHEDULED,
      cancelReason: null,
    };
    eventRepo.findOneBy.mockResolvedValue(event);
    eventRepo.save.mockImplementation(async (value) => value);

    const result = await service.cancel('team-1', 'event-1', {
      version: 0,
      reason: 'Field flooded',
    });

    expect(result).toMatchObject({
      status: EventStatus.CANCELLED,
      cancelReason: 'Field flooded',
      version: 1,
    });
    expect(emitter.emit).toHaveBeenCalledWith('event.cancelled', expect.anything());
  });

  it('does not reinstate a cancelled event after its original start time', async () => {
    eventRepo.findOneBy.mockResolvedValue({
      id: 'event-1',
      version: 1,
      status: EventStatus.CANCELLED,
      startsAt: new Date('2020-01-01T15:00:00.000Z'),
    });

    await expect(service.reinstate('team-1', 'event-1', 1)).rejects.toThrow(
      UnprocessableEntityException,
    );
    expect(eventRepo.save).not.toHaveBeenCalled();
  });

  it('returns an overlap warning while preserving the event', async () => {
    const saved = {
      id: 'event-2',
      startsAt: new Date('2026-10-10T15:30:00.000Z'),
      status: EventStatus.SCHEDULED,
    };
    seasonRepo.findOneBy.mockResolvedValue({ id: 'season-1' });
    eventRepo.create.mockReturnValue(saved);
    eventRepo.save.mockResolvedValue(saved);
    eventRepo.find.mockResolvedValue([{ id: 'event-1', status: EventStatus.SCHEDULED }]);

    const result = await service.create('team-1', {
      title: 'Game',
      type: EventType.GAME,
      startsAt: '2026-10-10T15:30:00.000Z',
    });

    expect(result.warnings).toEqual(['Overlaps with 1 other event(s) within 1 hour']);
    expect(eventRepo.save).toHaveBeenCalledWith(saved);
  });
});
