import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createTestApp, teardownTestApp } from './helpers/test-app';

describe('BDR-010: Announcements (e2e)', () => {
  let app: INestApplication;
  let coachToken: string;
  let playerToken: string;
  let teamId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    const r1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'ann-coach@example.com', displayName: 'Ann Coach', password: 'Password1!' });
    coachToken = r1.body.accessToken;

    const r2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'ann-player@example.com', displayName: 'Ann Player', password: 'Password1!' });
    playerToken = r2.body.accessToken;

    const t = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Announcements Test Team' })
      .expect(201);
    teamId = t.body.id;

    // Add player as member via invite flow
    const inv = await request(app.getHttpServer())
      .post(`/teams/${teamId}/invites`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ role: 'PLAYER' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/invites/${inv.body.token}/accept`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(201);
  });

  afterAll(teardownTestApp);

  // Scenario 1 — Coach posts an announcement (AC-1: basic create)
  it('coach can post an announcement → 201 with correct fields', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Team Meeting', body: 'Come to practice', pinned: false })
      .expect(201);

    expect(res.body.title).toBe('Team Meeting');
    expect(res.body.body).toBe('Come to practice');
    expect(res.body.pinned).toBe(false);
    expect(res.body.id).toBeDefined();
    // New fields — defaults
    expect(res.body.targetAudience).toBe('ALL');
    expect(res.body.urgent).toBe(false);
  });

  // AC-1/FR-1a: targetAudience = PLAYERS stored correctly
  it('coach can post a PLAYERS-targeted urgent announcement → 201 with correct fields', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Players Only', body: 'Drills today', targetAudience: 'PLAYERS', urgent: true })
      .expect(201);

    expect(res.body.targetAudience).toBe('PLAYERS');
    expect(res.body.urgent).toBe(true);
  });

  // FR-1c: PLAYER sees PLAYERS-targeted and ALL announcements, not PARENTS-only
  it('player sees ALL and PLAYERS announcements but NOT PARENTS-only (FR-1c)', async () => {
    // Post a PARENTS-only announcement
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Parents Only Msg', body: 'Parent info', targetAudience: 'PARENTS' })
      .expect(201);

    // Player fetches announcements
    const list = await request(app.getHttpServer())
      .get(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);

    const titles: string[] = list.body.map((a: { title: string }) => a.title);
    expect(titles).not.toContain('Parents Only Msg');
    // Players-targeted one should be visible
    expect(titles).toContain('Players Only');
  });

  // Scenario 2 — Player cannot post → 403
  it('player cannot post an announcement → 403', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ title: 'Unauthorized', body: 'Should not work' })
      .expect(403);
  });

  // Scenario 3 — Pinned announcement appears first in list
  it('GET /teams/:teamId/announcements returns pinned entries first', async () => {
    // Post a normal announcement
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Regular Notice', body: 'Normal info', pinned: false })
      .expect(201);

    // Post a pinned announcement after the normal one
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Pinned Alert', body: 'Important!', pinned: true })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThanOrEqual(2);
    // First result must be pinned
    expect(list.body[0].pinned).toBe(true);
    expect(list.body[0].title).toBe('Pinned Alert');
  });

  // Scenario 4 — Coach deletes an announcement → 204
  it('coach can delete an announcement → 204', async () => {
    const created = await request(app.getHttpServer())
      .post(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'To Be Deleted', body: 'Gone soon', pinned: false })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/teams/${teamId}/announcements/${created.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(204);

    // Confirm it no longer appears in the list
    const list = await request(app.getHttpServer())
      .get(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    const found = list.body.find((a: { id: string }) => a.id === created.body.id);
    expect(found).toBeUndefined();
  });

  // Scenario 5 — Player cannot delete an announcement → 403
  it('player cannot delete an announcement → 403', async () => {
    const created = await request(app.getHttpServer())
      .post(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Player Delete Target', body: 'Player should not delete this', pinned: false })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/teams/${teamId}/announcements/${created.body.id}`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(403);
  });
});
