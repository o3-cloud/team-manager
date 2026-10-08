import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { TeamRole } from '../common/enums/team-role.enum';
import { EventStatus } from '../events/entities/event.entity';
import { RsvpStatus } from './entities/rsvp.entity';
import { RsvpService } from './rsvp.service';

describe('RsvpService BDR rules', () => {
  const rsvpRepo = { findOneBy: jest.fn(), create: jest.fn(), save: jest.fn() };
  const eventRepo = { findOneBy: jest.fn() };
  const membershipRepo = { findOneBy: jest.fn() };
  const linkRepo = { createQueryBuilder: jest.fn() };
  let service: RsvpService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RsvpService(
      rsvpRepo as never,
      eventRepo as never,
      membershipRepo as never,
      linkRepo as never,
    );
  });

  it('blocks new RSVPs for cancelled events', async () => {
    eventRepo.findOneBy.mockResolvedValue({ status: EventStatus.CANCELLED });

    await expect(
      service.upsert('team-1', 'event-1', 'player-1', { status: RsvpStatus.GOING }),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(rsvpRepo.save).not.toHaveBeenCalled();
  });

  it('does not let a player RSVP on behalf of another user', async () => {
    eventRepo.findOneBy.mockResolvedValue({ status: EventStatus.SCHEDULED });
    membershipRepo.findOneBy.mockResolvedValue({ role: TeamRole.PLAYER });

    await expect(
      service.upsert('team-1', 'event-1', 'player-1', {
        status: RsvpStatus.GOING,
        onBehalfOfUserId: 'player-2',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(linkRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('allows a linked parent to update the player RSVP', async () => {
    const existing = { eventId: 'event-1', userId: 'player-1', status: RsvpStatus.MAYBE };
    eventRepo.findOneBy.mockResolvedValue({ status: EventStatus.SCHEDULED });
    membershipRepo.findOneBy.mockResolvedValue({ role: TeamRole.PARENT });
    linkRepo.createQueryBuilder.mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 'link-1' }),
    });
    rsvpRepo.findOneBy.mockResolvedValue(existing);
    rsvpRepo.save.mockImplementation(async (value) => value);

    await expect(
      service.upsert('team-1', 'event-1', 'parent-1', {
        status: RsvpStatus.GOING,
        onBehalfOfUserId: 'player-1',
      }),
    ).resolves.toMatchObject({ userId: 'player-1', status: RsvpStatus.GOING });
  });
});
