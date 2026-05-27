import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createTestApp, teardownTestApp } from './helpers/test-app';

async function inviteAndAccept(
  app: INestApplication,
  teamId: string,
  coachToken: string,
  memberToken: string,
  role: string,
): Promise<void> {
  const inv = await request(app.getHttpServer())
    .post(`/teams/${teamId}/invites`)
    .set('Authorization', `Bearer ${coachToken}`)
    .send({ role })
    .expect(201);

  await request(app.getHttpServer())
    .post(`/invites/${inv.body.token}/accept`)
    .set('Authorization', `Bearer ${memberToken}`)
    .expect(201);
}

describe('BDR-006: Recurring Events (e2e)', () => {
  let app: INestApplication;
  let coachToken: string;
  let playerToken: string;
  let teamId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    const r1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'recurring-coach@example.com',
        displayName: 'Recurring Coach',
        password: 'Password1!',
      });
    coachToken = r1.body.accessToken;

    const r2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'recurring-player@example.com',
        displayName: 'Recurring Player',
        password: 'Password1!',
      });
    playerToken = r2.body.accessToken;

    const t = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Recurring Events Test Team' })
      .expect(201);
    teamId = t.body.id;

    await inviteAndAccept(app, teamId, coachToken, playerToken, 'PLAYER');

    await request(app.getHttpServer())
      .post(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Recurring Season 2027', startDate: '2027-01-01', endDate: '2027-12-31' })
      .expect(201);
  });

  afterAll(teardownTestApp);

  // BDR-006 Scenario 1 — Coach creates a weekly recurring series
  it('coach creates a weekly recurring series and receives series and instances', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/recurring-events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        title: 'Weekly Practice',
        type: 'PRACTICE',
        rruleString: 'FREQ=WEEKLY;COUNT=4',
        firstStartsAt: '2027-06-02T10:00:00Z',
        endDate: '2027-06-30',
      })
      .expect(201);

    expect(res.body.series).toBeDefined();
    expect(res.body.series.id).toBeDefined();
    expect(res.body.instances).toBeDefined();
    expect(Array.isArray(res.body.instances)).toBe(true);
    expect(res.body.instances.length).toBe(4);
    res.body.instances.forEach(
      (instance: { title: string; type: string; status: string; seriesId: string }) => {
        expect(instance.title).toBe('Weekly Practice');
        expect(instance.type).toBe('PRACTICE');
        expect(instance.status).toBe('SCHEDULED');
        expect(instance.seriesId).toBe(res.body.series.id);
      },
    );
  });

  // BDR-006 — Instance count within 365 cap
  it('instance count for a 4-occurrence series does not exceed the 365-instance cap', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/recurring-events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        title: 'Capped Practice',
        type: 'PRACTICE',
        rruleString: 'FREQ=WEEKLY;COUNT=4',
        firstStartsAt: '2027-07-07T09:00:00Z',
        endDate: '2027-07-31',
      })
      .expect(201);

    expect(res.body.instances.length).toBeLessThanOrEqual(365);
  });

  // BDR-006 Scenario 2 — Player can see recurring instances in the team schedule
  it('player fetches the team schedule and sees individual recurring instances', async () => {
    const seriesRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/recurring-events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        title: 'Player-Visible Practice',
        type: 'PRACTICE',
        rruleString: 'FREQ=WEEKLY;COUNT=3',
        firstStartsAt: '2027-08-04T10:00:00Z',
        endDate: '2027-08-25',
      })
      .expect(201);

    const instanceIds: string[] = seriesRes.body.instances.map((i: { id: string }) => i.id);

    const schedule = await request(app.getHttpServer())
      .get(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);

    const scheduleIds: string[] = schedule.body.map((e: { id: string }) => e.id);
    instanceIds.forEach((id) => {
      expect(scheduleIds).toContain(id);
    });
  });

  // BDR-006 — Player cannot create a recurring series (403)
  it('player receives 403 when attempting to create a recurring series', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/recurring-events`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({
        title: 'Unauthorized Practice',
        type: 'PRACTICE',
        rruleString: 'FREQ=WEEKLY;COUNT=4',
        firstStartsAt: '2027-09-01T10:00:00Z',
        endDate: '2027-09-30',
      })
      .expect(403);
  });

  // BDR-006 Scenario 4 — Cancel entire series
  it('cancelling the entire series marks all future instances as CANCELLED', async () => {
    const seriesRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/recurring-events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        title: 'Series To Cancel',
        type: 'PRACTICE',
        rruleString: 'FREQ=WEEKLY;COUNT=4',
        firstStartsAt: '2027-10-06T10:00:00Z',
        endDate: '2027-10-31',
      })
      .expect(201);

    const seriesId: string = seriesRes.body.series.id;
    const instanceIds: string[] = seriesRes.body.instances.map((i: { id: string }) => i.id);

    const cancelRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/recurring-events/${seriesId}/cancel`)
      .set('Authorization', `Bearer ${coachToken}`);
    expect([200, 201, 204]).toContain(cancelRes.status);

    const schedule = await request(app.getHttpServer())
      .get(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    instanceIds.forEach((id) => {
      const instance = schedule.body.find((e: { id: string }) => e.id === id);
      expect(instance).toBeDefined();
      expect(instance.status).toBe('CANCELLED');
    });
  });

  // BDR-006 Scenario 3 — Cancel a single instance; only that instance is cancelled
  it('cancelling a single instance leaves other instances in the series SCHEDULED', async () => {
    const seriesRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/recurring-events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        title: 'Series Single Cancel',
        type: 'PRACTICE',
        rruleString: 'FREQ=WEEKLY;COUNT=3',
        firstStartsAt: '2027-11-03T10:00:00Z',
        endDate: '2027-11-24',
      })
      .expect(201);

    const instances: Array<{ id: string }> = seriesRes.body.instances as Array<{ id: string }>;
    expect(instances.length).toBe(3);

    const [inst0, inst1, inst2] = instances as [{ id: string }, { id: string }, { id: string }];

    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${inst1.id}/cancel`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ version: 0 })
      .expect(201);

    const schedule = await request(app.getHttpServer())
      .get(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    const first = schedule.body.find((e: { id: string }) => e.id === inst0.id);
    const second = schedule.body.find((e: { id: string }) => e.id === inst1.id);
    const third = schedule.body.find((e: { id: string }) => e.id === inst2.id);

    expect(first).toBeDefined();
    expect(first.status).toBe('SCHEDULED');
    expect(second).toBeDefined();
    expect(second.status).toBe('CANCELLED');
    expect(third).toBeDefined();
    expect(third.status).toBe('SCHEDULED');
  });

  // BDR-006 — Invalid rrule string returns 400
  it('creating a series with an invalid rrule string returns 400', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/recurring-events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        title: 'Bad Rule Series',
        type: 'PRACTICE',
        rruleString: 'NOT_A_VALID_RRULE',
        firstStartsAt: '2027-06-01T10:00:00Z',
        endDate: '2027-06-30',
      })
      .expect(400);
  });
});
