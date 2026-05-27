import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createTestApp, teardownTestApp } from './helpers/test-app';

describe('BDR-012: Team Joining / Invitations (e2e)', () => {
  let app: INestApplication;
  let coachToken: string;
  let playerToken: string;
  let teamId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    const r1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invite-coach@example.com', displayName: 'Invite Coach', password: 'Password1!' });
    coachToken = r1.body.accessToken;

    const r2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invite-player@example.com', displayName: 'Invite Player', password: 'Password1!' });
    playerToken = r2.body.accessToken;

    const t = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Invite Test Team' })
      .expect(201);
    teamId = t.body.id;
  });

  afterAll(teardownTestApp);

  // Scenario 1 — Successful invite acceptance (AC-2.2: accepted invite still works after hashing)
  it('player accepts invite and joins team with correct role', async () => {
    const invite = await request(app.getHttpServer())
      .post(`/teams/${teamId}/invites`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ role: 'PLAYER' })
      .expect(201);

    const token = invite.body.token;
    expect(token).toHaveLength(64);

    await request(app.getHttpServer())
      .post(`/invites/${token}/accept`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(201);

    const members = await request(app.getHttpServer())
      .get(`/teams/${teamId}/members`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(members.body.some((m: { role: string }) => m.role === 'PLAYER')).toBe(true);
  });

  // Scenario 4 — Duplicate membership rejected
  it('rejects accepting invite when already a member', async () => {
    const invite = await request(app.getHttpServer())
      .post(`/teams/${teamId}/invites`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ role: 'PLAYER' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/invites/${invite.body.token}/accept`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(409);
  });

  // Scenario 3 — Revoked invite rejected
  it('revoked invite cannot be accepted', async () => {
    const r3 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invite-player2@example.com', displayName: 'Invite Player 2', password: 'Password1!' });
    const playerToken2 = r3.body.accessToken;

    const invite = await request(app.getHttpServer())
      .post(`/teams/${teamId}/invites`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ role: 'PLAYER' })
      .expect(201);

    const rawToken = invite.body.token;

    await request(app.getHttpServer())
      .delete(`/teams/${teamId}/invites/${invite.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/invites/${rawToken}/accept`)
      .set('Authorization', `Bearer ${playerToken2}`)
      .expect(410);
  });

  // Scenario 2 — Already-accepted invite cannot be reused
  it('already-accepted invite cannot be reused', async () => {
    const r4 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invite-player3@example.com', displayName: 'Invite Player 3', password: 'Password1!' });
    const playerToken3 = r4.body.accessToken;

    const r5 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invite-player4@example.com', displayName: 'Invite Player 4', password: 'Password1!' });
    const playerToken4 = r5.body.accessToken;

    const invite = await request(app.getHttpServer())
      .post(`/teams/${teamId}/invites`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ role: 'PLAYER' })
      .expect(201);

    const rawToken = invite.body.token;

    await request(app.getHttpServer())
      .post(`/invites/${rawToken}/accept`)
      .set('Authorization', `Bearer ${playerToken3}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/invites/${rawToken}/accept`)
      .set('Authorization', `Bearer ${playerToken4}`)
      .expect(410);
  });

  // AC-2.1 — Token absent from invite list response (F-2)
  it('invite list does not expose raw token', async () => {
    const invites = await request(app.getHttpServer())
      .get(`/teams/${teamId}/invites`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(Array.isArray(invites.body)).toBe(true);
    for (const invite of invites.body) {
      expect(invite).not.toHaveProperty('token');
      expect(invite).not.toHaveProperty('tokenHash');
      expect(invite).toHaveProperty('id');
      expect(invite).toHaveProperty('status');
    }
  });

  // AC-5.1 — Double-revoke returns 200 both times (F-5)
  it('revoking an already-revoked invite returns 200 (idempotent)', async () => {
    const r6 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invite-player5@example.com', displayName: 'Invite Player 5', password: 'Password1!' });
    const playerToken5 = r6.body.accessToken;
    void playerToken5;

    const invite = await request(app.getHttpServer())
      .post(`/teams/${teamId}/invites`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ role: 'PLAYER' })
      .expect(201);

    const first = await request(app.getHttpServer())
      .delete(`/teams/${teamId}/invites/${invite.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(first.body.status).toBe('REVOKED');

    const second = await request(app.getHttpServer())
      .delete(`/teams/${teamId}/invites/${invite.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(second.body.status).toBe('REVOKED');
  });

  // AC-5.2 — Revoking an ACCEPTED invite still returns 409 (unchanged)
  it('revoking an already-accepted invite returns 409', async () => {
    const r7 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invite-player6@example.com', displayName: 'Invite Player 6', password: 'Password1!' });
    const playerToken6 = r7.body.accessToken;

    const invite = await request(app.getHttpServer())
      .post(`/teams/${teamId}/invites`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ role: 'PLAYER' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/invites/${invite.body.token}/accept`)
      .set('Authorization', `Bearer ${playerToken6}`)
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/teams/${teamId}/invites/${invite.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(409);
  });
});
