import { validate } from 'class-validator';
import { CancelEventDto } from './events/dto/cancel-event.dto';
import { CreateEventDto } from './events/dto/create-event.dto';
import { EventType } from './events/entities/event.entity';
import { RecordGameResultDto } from './game-results/dto/record-game-result.dto';
import { CreateTeamDto } from './teams/dto/create-team.dto';

describe('BDR request validation', () => {
  it('rejects event requests missing title, type, and a valid start time', async () => {
    const errors = await validate(
      Object.assign(new CreateEventDto(), { title: '', startsAt: 'tomorrow' }),
    );

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['title', 'type', 'startsAt']),
    );
  });

  it('rejects team names containing HTML or SQL metacharacters', async () => {
    const errors = await validate(
      Object.assign(new CreateTeamDto(), { name: "U12'; DROP TABLE teams" }),
    );

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });

  it('rejects negative scores and non-UUID season IDs', async () => {
    const errors = await validate(
      Object.assign(new RecordGameResultDto(), { seasonId: 'season-1', ownScore: -1, oppScore: 2 }),
    );

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['seasonId', 'ownScore']),
    );
  });

  it('accepts a valid event and non-negative cancellation version', async () => {
    const eventErrors = await validate(
      Object.assign(new CreateEventDto(), {
        title: 'Practice',
        type: EventType.PRACTICE,
        startsAt: '2026-10-10T15:00:00.000Z',
      }),
    );
    const cancelErrors = await validate(Object.assign(new CancelEventDto(), { version: 0 }));

    expect(eventErrors).toHaveLength(0);
    expect(cancelErrors).toHaveLength(0);
  });
});
