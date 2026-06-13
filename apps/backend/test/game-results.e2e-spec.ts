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

describe('BDR-009: Game Results (e2e)', () => {
  let app: INestApplication;
  let coachToken: string;
  let playerToken: string;
  let teamId: string;
  let seasonId: string;

  // Each scenario that records a result uses its own event to avoid 409 conflicts
  let winEventId: string;
  let tieEventId: string;
  let lossEventId: string;
  let updateEventId: string;
  let practiceEventId: string;
  let duplicateEventId: string;
  let recordEventId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    // Register users
    const coachRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'gr-coach@example.com', displayName: 'GR Coach', password: 'Password1!' });
    coachToken = coachRes.body.accessToken;

    const playerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'gr-player@example.com', displayName: 'GR Player', password: 'Password1!' });
    playerToken = playerRes.body.accessToken;

    // Coach creates team
    const teamRes = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Game Results Test Team' })
      .expect(201);
    teamId = teamRes.body.id;

    // Add player as member via invite flow
    await inviteAndAccept(app, teamId, coachToken, playerToken, 'PLAYER');

    // Create an active season
    const seasonRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'GR Season', startDate: '2026-01-01', endDate: '2026-12-31' })
      .expect(201);
    seasonId = seasonRes.body.id;

    // Helper to create a GAME event
    async function createGameEvent(title: string, startsAt: string): Promise<string> {
      const res = await request(app.getHttpServer())
        .post(`/teams/${teamId}/events`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send({ title, type: 'GAME', startsAt })
        .expect(201);
      return res.body.id;
    }

    // Create one PRACTICE event to test non-game rejection (AC-5 / BDR-009 Scenario 4)
    const practiceRes = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Practice Session', type: 'PRACTICE', startsAt: '2027-03-01T09:00:00Z' })
      .expect(201);
    practiceEventId = practiceRes.body.id;

    // Create individual GAME events for each test scenario
    winEventId = await createGameEvent('Win Game', '2027-04-01T15:00:00Z');
    tieEventId = await createGameEvent('Tie Game', '2027-04-08T15:00:00Z');
    lossEventId = await createGameEvent('Loss Game', '2027-04-15T15:00:00Z');
    updateEventId = await createGameEvent('Update Game', '2027-04-22T15:00:00Z');
    duplicateEventId = await createGameEvent('Duplicate Game', '2027-04-29T15:00:00Z');
    recordEventId = await createGameEvent('Record View Game', '2027-05-06T15:00:00Z');
  });

  afterAll(teardownTestApp);

  // Scenario 1 — Record a win; outcome is derived (AC-1, AC-2)
  it('coach records 3-1 score → outcome is WIN', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${winEventId}/game-result`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ seasonId, ownScore: 3, oppScore: 1 })
      .expect(201);

    expect(res.body.ownScore).toBe(3);
    expect(res.body.oppScore).toBe(1);
    expect(res.body.outcome).toBe('WIN');
  });

  // TIE scenario (AC-2)
  it('coach records 3-3 score → outcome is TIE', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${tieEventId}/game-result`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ seasonId, ownScore: 3, oppScore: 3 })
      .expect(201);

    expect(res.body.outcome).toBe('TIE');
  });

  // LOSS scenario (AC-2)
  it('coach records 1-3 score → outcome is LOSS', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${lossEventId}/game-result`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ seasonId, ownScore: 1, oppScore: 3 })
      .expect(201);

    expect(res.body.outcome).toBe('LOSS');
  });

  // Duplicate record → 409 (AC-3 guard)
  it('recording a result for the same event twice returns 409', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${duplicateEventId}/game-result`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ seasonId, ownScore: 2, oppScore: 0 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${duplicateEventId}/game-result`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ seasonId, ownScore: 2, oppScore: 0 })
      .expect(409);
  });

  // Scenario 4 — Non-game event rejected (AC-5)
  it('recording a result for a PRACTICE event returns 422', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${practiceEventId}/game-result`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ seasonId, ownScore: 2, oppScore: 1 })
      .expect(422);
  });

  // Player cannot record → 403
  it('player cannot record a game result', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${winEventId}/game-result`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ seasonId, ownScore: 3, oppScore: 1 })
      .expect(403);
  });

  // Scenario 3 — Coach updates score; outcome is recalculated (AC-4)
  it('coach updates score → outcome is recalculated', async () => {
    // First record a WIN (2-0)
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${updateEventId}/game-result`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ seasonId, ownScore: 2, oppScore: 0 })
      .expect(201);

    // Update to a LOSS (1-2)
    const updated = await request(app.getHttpServer())
      .patch(`/teams/${teamId}/events/${updateEventId}/game-result`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ ownScore: 1, oppScore: 2 })
      .expect(200);

    expect(updated.body.ownScore).toBe(1);
    expect(updated.body.oppScore).toBe(2);
    expect(updated.body.outcome).toBe('LOSS');
  });

  // GET single game result (AC-1, Scenario 5)
  it('team member can GET the result for a game event', async () => {
    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/events/${winEventId}/game-result`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);

    expect(res.body.ownScore).toBe(3);
    expect(res.body.oppScore).toBe(1);
    expect(res.body.outcome).toBe('WIN');
  });

  // Scenario 2 — Season record reflects all results (AC-3)
  it('GET season record returns cumulative wins/losses/ties and goals scored', async () => {
    // At this point: WIN (3-1), TIE (3-3), LOSS (1-3), LOSS (2-0 → updated to 1-2), WIN (duplicate 2-0)
    // winEventId=WIN, tieEventId=TIE, lossEventId=LOSS, updateEventId=LOSS (updated), duplicateEventId=WIN
    // Also recordEventId has no result yet
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${recordEventId}/game-result`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ seasonId, ownScore: 4, oppScore: 0 })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/seasons/${seasonId}/record`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('wins');
    expect(res.body).toHaveProperty('losses');
    expect(res.body).toHaveProperty('ties');
    expect(typeof res.body.wins).toBe('number');
    expect(typeof res.body.losses).toBe('number');
    expect(typeof res.body.ties).toBe('number');
    expect(res.body.wins + res.body.losses + res.body.ties).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('goalsScored');
    expect(res.body).toHaveProperty('attendanceRate');
    expect(typeof res.body.goalsScored).toBe('number');
    expect(res.body.attendanceRate).toBeNull();
  });

  // Scenario 2b — Goals scored aggregate
  it('GET season record sums ownScore across all games for goalsScored', async () => {
    // Existing game results at this point:
    // WIN 3-1, TIE 3-3, LOSS 1-3, updateEventId now LOSS 1-2, duplicate WIN 2-0, recordEventId WIN 4-0
    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/seasons/${seasonId}/record`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    // 3 + 3 + 1 + 1 + 2 + 4 = 14
    expect(res.body.goalsScored).toBe(14);
  });

  // Player can also view season record (AC-1 — visible to all members)
  it('player can view season record', async () => {
    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/seasons/${seasonId}/record`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('wins');
    expect(res.body).toHaveProperty('losses');
    expect(res.body).toHaveProperty('ties');
  });

  // Unauthenticated request → 401
  it('unauthenticated request is rejected', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/events/${winEventId}/game-result`)
      .send({ seasonId, ownScore: 3, oppScore: 1 })
      .expect(401);
  });
});
