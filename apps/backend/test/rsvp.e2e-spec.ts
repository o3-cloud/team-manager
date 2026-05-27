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

describe('BDR-007: RSVP (e2e)', () => {
  let app: INestApplication;
  let coachToken: string;
  let playerToken: string;
  let nonMemberToken: string;
  let teamId: string;
  let eventId: string;
  let cancelledEventId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    // Register users
    const coachRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'rsvp-coach@example.com', displayName: 'RSVP Coach', password: 'Password1!' });
    coachToken = coachRes.body.accessToken;

    const playerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'rsvp-player@example.com', displayName: 'RSVP Player', password: 'Password1!' });
    playerToken = playerRes.body.accessToken;

    const nonMemberRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'rsvp-nonmember@example.com', displayName: 'RSVP Non-Member', password: 'Password1!' });
    nonMemberToken = nonMemberRes.body.accessToken;

    // Coach creates team
    const teamRes = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'RSVP Test Team' })
      .expect(201);
    teamId = teamRes.body.id;

    // Add player as member via invite flow
    await inviteAndAccept(app, teamId, coachToken, playerToken, 'PLAYER');

    // Create an active season
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'RSVP Season', startDate: '2026-01-01', endDate: '2026-12-31' })
      .expect(201);

    // Create a scheduled GAME event (future)
    const eventRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'RSVP Game', type: 'GAME', startsAt: '2027-06-15T10:00:00Z' })
      .expect(201);
    eventId = eventRes.body.id;

    // Create a second event and cancel it
    const cancelledRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Cancelled Game', type: 'GAME', startsAt: '2027-07-01T10:00:00Z' })
      .expect(201);
    cancelledEventId = cancelledRes.body.id;

    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${cancelledEventId}/cancel`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ reason: 'Rain', version: 0 })
      .expect(201);
  });

  afterAll(teardownTestApp);

  // Scenario 1 — Player submits RSVP (AC-1)
  it('player can RSVP GOING to a scheduled event', async () => {
    const res = await request(app.getHttpServer())
      .put(`/teams/${teamId}/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ status: 'GOING' })
      .expect(200);

    expect(res.body.status).toBe('GOING');
    expect(res.body.eventId).toBe(eventId);
  });

  // Scenario 3 — RSVP update replaces previous (AC-3)
  it('player can change RSVP and only latest status is stored', async () => {
    const res = await request(app.getHttpServer())
      .put(`/teams/${teamId}/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ status: 'MAYBE' })
      .expect(200);

    expect(res.body.status).toBe('MAYBE');
  });

  // RSVP to cancelled event → 422 (AC-1 guard)
  it('cannot RSVP to a cancelled event', async () => {
    await request(app.getHttpServer())
      .put(`/teams/${teamId}/events/${cancelledEventId}/rsvp`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ status: 'GOING' })
      .expect(422);
  });

  // Scenario 4 — Coach views all RSVPs with nonRespondents list (AC-4, AC-5)
  it('GET RSVPs returns rsvps array and nonRespondents list', async () => {
    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('rsvps');
    expect(res.body).toHaveProperty('nonRespondents');
    expect(Array.isArray(res.body.rsvps)).toBe(true);
    expect(Array.isArray(res.body.nonRespondents)).toBe(true);

    // Player has RSVPed — should appear in rsvps, not nonRespondents
    const playerRsvp = res.body.rsvps.find((r: { status: string }) => r.status === 'MAYBE');
    expect(playerRsvp).toBeDefined();

    // Coach has not RSVPed — should appear in nonRespondents
    expect(res.body.nonRespondents.length).toBeGreaterThan(0);
  });

  // Non-member cannot RSVP → 403
  it('non-member cannot RSVP to a team event', async () => {
    await request(app.getHttpServer())
      .put(`/teams/${teamId}/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .send({ status: 'GOING' })
      .expect(403);
  });

  // Non-member cannot read RSVPs → 403
  it('non-member cannot read RSVPs', async () => {
    await request(app.getHttpServer())
      .get(`/teams/${teamId}/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .expect(403);
  });

  // Unauthenticated request → 401
  it('unauthenticated request is rejected', async () => {
    await request(app.getHttpServer())
      .put(`/teams/${teamId}/events/${eventId}/rsvp`)
      .send({ status: 'GOING' })
      .expect(401);
  });
});
