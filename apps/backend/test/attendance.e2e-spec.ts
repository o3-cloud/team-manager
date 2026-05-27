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

describe('BDR-008: Attendance Tracking (e2e)', () => {
  let app: INestApplication;
  let coachToken: string;
  let playerToken: string;
  let teamId: string;
  let pastEventId: string;
  let futureEventId: string;
  let rosterEntryId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    // Register users
    const coachRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'att-coach@example.com', displayName: 'Attendance Coach', password: 'Password1!' });
    coachToken = coachRes.body.accessToken;

    const playerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'att-player@example.com', displayName: 'Attendance Player', password: 'Password1!' });
    playerToken = playerRes.body.accessToken;
    const playerUserId: string = playerRes.body.user.id;

    // Coach creates team
    const teamRes = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Attendance Test Team' })
      .expect(201);
    teamId = teamRes.body.id;

    // Add player as member via invite flow
    await inviteAndAccept(app, teamId, coachToken, playerToken, 'PLAYER');

    // Create an active season
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Attendance Season', startDate: '2019-01-01', endDate: '2025-12-31' })
      .expect(201);

    // Add player to roster (linked to their userId)
    const rosterRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ displayName: 'Player One', userId: playerUserId })
      .expect(201);
    rosterEntryId = rosterRes.body.id;

    // Create a PAST event (startsAt in the past)
    const pastEventRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Past Practice', type: 'PRACTICE', startsAt: '2020-01-01T10:00:00Z' })
      .expect(201);
    pastEventId = pastEventRes.body.id;

    // Create a FUTURE event
    const futureEventRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Future Practice', type: 'PRACTICE', startsAt: '2027-06-15T10:00:00Z' })
      .expect(201);
    futureEventId = futureEventRes.body.id;
  });

  afterAll(teardownTestApp);

  // Scenario 1 — Coach marks attendance for a past event (AC-1)
  it('coach can mark attendance PRESENT for a past event', async () => {
    const res = await request(app.getHttpServer())
      .put(`/teams/${teamId}/events/${pastEventId}/attendance`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ rosterEntryId, mark: 'PRESENT' })
      .expect(200);

    expect(res.body.mark).toBe('PRESENT');
    expect(res.body.rosterEntryId).toBe(rosterEntryId);
    expect(res.body.eventId).toBe(pastEventId);
  });

  // Scenario 3 — Update attendance mark (AC-3)
  it('coach can update attendance from PRESENT to ABSENT', async () => {
    const res = await request(app.getHttpServer())
      .put(`/teams/${teamId}/events/${pastEventId}/attendance`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ rosterEntryId, mark: 'ABSENT' })
      .expect(200);

    expect(res.body.mark).toBe('ABSENT');
  });

  // Scenario 4 — Retrieve full attendance list (AC-4)
  it('GET attendance returns all records for a past event', async () => {
    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/events/${pastEventId}/attendance`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const record = res.body.find((r: { rosterEntryId: string }) => r.rosterEntryId === rosterEntryId);
    expect(record).toBeDefined();
    expect(record.mark).toBe('ABSENT');
  });

  // Scenario 2 — Future event rejected (AC-2)
  it('cannot mark attendance for a future event', async () => {
    await request(app.getHttpServer())
      .put(`/teams/${teamId}/events/${futureEventId}/attendance`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ rosterEntryId, mark: 'PRESENT' })
      .expect(422);
  });

  // Player role cannot mark attendance → 403
  it('player without mark role cannot mark attendance', async () => {
    await request(app.getHttpServer())
      .put(`/teams/${teamId}/events/${pastEventId}/attendance`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ rosterEntryId, mark: 'PRESENT' })
      .expect(403);
  });

  // Unauthenticated request → 401
  it('unauthenticated request is rejected', async () => {
    await request(app.getHttpServer())
      .put(`/teams/${teamId}/events/${pastEventId}/attendance`)
      .send({ rosterEntryId, mark: 'PRESENT' })
      .expect(401);
  });
});
