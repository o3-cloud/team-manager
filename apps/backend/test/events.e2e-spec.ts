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

describe('BDR-005 + BDR-015: Event Scheduling and Cancellation (e2e)', () => {
  let app: INestApplication;
  let coachToken: string;
  let playerToken: string;
  let teamId: string;
  let seasonId: string;
  let eventId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    // Register coach
    const r1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'events-coach@example.com', displayName: 'Events Coach', password: 'Password1!' });
    coachToken = r1.body.accessToken;

    // Register player
    const r2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'events-player@example.com', displayName: 'Events Player', password: 'Password1!' });
    playerToken = r2.body.accessToken;

    // Coach creates a team (coach automatically becomes COACH member)
    const t = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Events Test Team' })
      .expect(201);
    teamId = t.body.id;

    // Add player as a team member via invite flow
    await inviteAndAccept(app, teamId, coachToken, playerToken, 'PLAYER');

    // Create an active season
    const s = await request(app.getHttpServer())
      .post(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Events Season 2030', startDate: '2030-01-01', endDate: '2030-12-31' })
      .expect(201);
    seasonId = s.body.id;
  });

  afterAll(teardownTestApp);

  // BDR-005 Scenario 1 — Coach creates a GAME event under the active season
  it('coach creates a GAME event and receives 201 with the event body', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Friday Game', type: 'GAME', startsAt: '2030-06-01T10:00:00Z' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Friday Game');
    expect(res.body.type).toBe('GAME');
    expect(res.body.status).toBe('SCHEDULED');
    expect(res.body.seasonId).toBe(seasonId);
    expect(res.body.version).toBe(0);
    eventId = res.body.id;
  });

  // BDR-005 — Unauthenticated request receives 401
  it('unauthenticated request to POST /events receives 401', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events`)
      .send({ title: 'Sneaky Event', type: 'GAME', startsAt: '2030-06-01T10:00:00Z' })
      .expect(401);
  });

  // BDR-005 — Player (no write role) receives 403 on POST
  it('player receives 403 when attempting to create an event', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ title: 'Player Event', type: 'PRACTICE', startsAt: '2030-06-02T10:00:00Z' })
      .expect(403);
  });

  // BDR-005 Scenario 5 — Coach lists events for a team; event appears in list
  it('coach lists events for a team and the created event appears', async () => {
    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((e: { id: string }) => e.id === eventId)).toBe(true);
  });

  // BDR-005 Scenario 5 — Player can also list events (read access for all members)
  it('player can read the team schedule and sees the event', async () => {
    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);

    expect(res.body.some((e: { id: string }) => e.id === eventId)).toBe(true);
  });

  // BDR-005 Scenario 2 — Coach updates an event (include version field); version increments
  it('coach updates the event title and version increments to 1', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/teams/${teamId}/events/${eventId}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Updated Friday Game', version: 0 })
      .expect(200);

    expect(res.body.title).toBe('Updated Friday Game');
    expect(res.body.version).toBe(1);
  });

  // BDR-005 Scenario 7 — Optimistic lock: update with stale version returns 409
  it('update with a stale version returns 409', async () => {
    // Event is now at version 1; submitting version 0 is stale
    await request(app.getHttpServer())
      .patch(`/teams/${teamId}/events/${eventId}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Stale Update', version: 0 })
      .expect(409);
  });

  // BDR-005 Scenario 4 — Missing required field (startsAt) returns 400
  it('creating an event without startsAt returns 400', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'No Date Event', type: 'GAME' })
      .expect(400);
  });

  // BDR-015 Scenario 1 + BDR-015 reason field — Coach cancels event with a reason
  it('coach cancels the event; status becomes CANCELLED and reason is stored', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${eventId}/cancel`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ version: 1, reason: 'Weather' })
      .expect(201);

    expect(res.body.status).toBe('CANCELLED');
    expect(res.body.cancelReason).toBe('Weather');
    expect(res.body.version).toBe(2);
  });

  // BDR-015 Scenario 3 — Cancelling an already-cancelled event returns 422
  it('cancelling an already-cancelled event returns 422', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${eventId}/cancel`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ version: 2, reason: 'Again' })
      .expect(422);
  });

  // BDR-015 Scenario 3 — Editing a CANCELLED event is rejected with 422
  it('editing a CANCELLED event returns 422', async () => {
    await request(app.getHttpServer())
      .patch(`/teams/${teamId}/events/${eventId}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Should Not Update', version: 2 })
      .expect(422);
  });

  // BDR-015 Scenario 8 — Player can read CANCELLED event with reason in the schedule
  it('player reads the cancelled event with its status and reason in the schedule', async () => {
    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);

    const cancelled = res.body.find((e: { id: string }) => e.id === eventId);
    expect(cancelled).toBeDefined();
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancelReason).toBe('Weather');
  });

  // BDR-015 Scenario 5 — Coach reinstates a CANCELLED event; status returns to SCHEDULED
  it('coach reinstates the cancelled event; status returns to SCHEDULED', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${eventId}/reinstate`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ version: 2 })
      .expect(201);

    expect(res.body.status).toBe('SCHEDULED');
    expect(res.body.version).toBe(3);
  });

  // BDR-015 Scenario 7 — Optimistic concurrency on cancellation: stale version returns 409
  it('cancellation with a stale version returns 409', async () => {
    // Event is now SCHEDULED at version 3; submit a stale version 1
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${eventId}/cancel`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ version: 1, reason: 'Stale cancel attempt' })
      .expect(409);
  });
});
