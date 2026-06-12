import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createTestApp, teardownTestApp } from './helpers/test-app';

describe('BDR-013: Season Management (e2e)', () => {
  let app: INestApplication;
  let coachToken: string;
  let playerToken: string;
  let teamId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    const r1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'season-coach@example.com', displayName: 'Season Coach', password: 'Password1!' });
    coachToken = r1.body.accessToken;

    const r2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'season-player@example.com', displayName: 'Season Player', password: 'Password1!' });
    playerToken = r2.body.accessToken;

    const t = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Season Test Team' })
      .expect(201);
    teamId = t.body.id;
  });

  afterAll(teardownTestApp);

  // Scenario 1 — Create a season
  it('coach can create a season and it appears in the list', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Fall 2026', startDate: '2026-09-01', endDate: '2026-11-30' })
      .expect(201);

    expect(res.body.name).toBe('Fall 2026');
    expect(res.body.status).toBe('ACTIVE');

    const list = await request(app.getHttpServer())
      .get(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(list.body.some((s: { name: string }) => s.name === 'Fall 2026')).toBe(true);
  });

  // Scenario 2 — Duplicate active season rejected
  it('rejects creating a second active season', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Duplicate Active', startDate: '2026-09-01', endDate: '2026-11-30' })
      .expect(409);
  });

  // Scenario 3 — Archive season
  it('coach can archive the active season', async () => {
    const list = await request(app.getHttpServer())
      .get(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    const active = list.body.find((s: { status: string }) => s.status === 'ACTIVE');
    expect(active).toBeDefined();

    const archived = await request(app.getHttpServer())
      .patch(`/teams/${teamId}/seasons/${active.id}/archive`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(archived.body.status).toBe('ARCHIVED');
  });

  // Scenario 4 — New season starts fresh after archive
  it('can create a new active season after archiving the previous one', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Spring 2027', startDate: '2027-03-01', endDate: '2027-05-31' })
      .expect(201);
  });

  // Non-member cannot access seasons
  it('non-member receives 403 on season endpoints', async () => {
    await request(app.getHttpServer())
      .get(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(403);
  });

  // BL-1 — Malformed seasonId on PATCH returns 400 (AC-9)
  it('returns 400 for malformed seasonId on PATCH /teams/:teamId/seasons/:seasonId/archive', async () => {
    await request(app.getHttpServer())
      .patch(`/teams/${teamId}/seasons/not-a-uuid/archive`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(400);
  });
});
