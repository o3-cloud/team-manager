import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createTestApp, teardownTestApp } from './helpers/test-app';

describe('BDR-002: Team Creation (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let token2: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    // Register two users
    const r1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'coach@example.com', displayName: 'Coach Smith', password: 'Password1!' });
    token = r1.body.accessToken;

    const r2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'coach2@example.com', displayName: 'Coach Jones', password: 'Password1!' });
    token2 = r2.body.accessToken;
  });

  afterAll(teardownTestApp);

  // Scenario 1 — Successful team creation
  it('creates a team and returns it in the team list', async () => {
    const create = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'U12 Red' })
      .expect(201);

    expect(create.body.name).toBe('U12 Red');

    const list = await request(app.getHttpServer())
      .get('/teams')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.map((t: { name: string }) => t.name)).toContain('U12 Red');
  });

  // Scenario 2 — Creator assigned COACH role
  it('assigns COACH role to the creator', async () => {
    const create = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'U14 Blue' })
      .expect(201);

    const members = await request(app.getHttpServer())
      .get(`/teams/${create.body.id}/members`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const creator = members.body.find((m: { role: string }) => m.role === 'COACH');
    expect(creator).toBeDefined();
  });

  // Scenario 3 — Blank team name
  it('rejects blank team name', async () => {
    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' })
      .expect(400);
  });

  // Scenario 4 — Whitespace-only team name (AC-4.1: blank name returns 400 not 409)
  it('rejects whitespace-only team name with 400', async () => {
    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '   ' })
      .expect(400);
  });

  // Scenario 5 — Team name too long
  it('rejects team name exceeding 100 characters', async () => {
    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'A'.repeat(101) })
      .expect(400);
  });

  // Scenario 6 — Multiple teams
  it('allows creating multiple teams for the same user', async () => {
    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Team Alpha' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Team Beta' })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get('/teams')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const names = list.body.map((t: { name: string }) => t.name);
    expect(names).toContain('Team Alpha');
    expect(names).toContain('Team Beta');
  });

  // Scenario 7 — Duplicate name same user (case-insensitive)
  it('rejects duplicate team name (case-insensitive) for same user', async () => {
    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Unique Squad' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'unique squad' })
      .expect(409);
  });

  // Scenario 8 — Duplicate name different user is allowed
  it('allows two users to each have a team with the same name', async () => {
    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Shared Name' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Shared Name' })
      .expect(201);
  });

  // Scenario 9 — IDOR protection
  it('returns 403 when fetching a team the user is not a member of', async () => {
    const res = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Private Team' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/teams/${res.body.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403);
  });

  // Scenario 10 — Non-existent team UUID returns 404 (AC-1.1, F-1)
  it('returns 404 for a non-existent team UUID', async () => {
    await request(app.getHttpServer())
      .get('/teams/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  // Scenario 11 — HTML metacharacters in name rejected (AC-3.1, F-3)
  it('rejects team name with HTML metacharacters', async () => {
    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '<script>alert(1)</script>' })
      .expect(400);
  });

  // Scenario 12 — SQL metacharacters in name rejected (AC-3.2, F-3)
  it('rejects team name with SQL metacharacters', async () => {
    await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: "'; DROP TABLE teams; --" })
      .expect(400);
  });
});
