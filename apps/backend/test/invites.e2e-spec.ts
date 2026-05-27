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

  // Scenario 1 — Successful invite acceptance
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
  it('rejcts accepting invite when already a member', async () => {
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

    await request(app.getHttpServer())
      .delete(`/teams/${teamId}/invites/${invite.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/invites/${invite.body.token}/accept`)
      .set('Authorization', `Bearer ${playerToken2}`)
      .expect(410);
  });

  // Scenario 2 — Expired invite rejected (simulated via already-accepted token)
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

    await request(app.getHttpServer())
      .post(`/invites/${invite.body.token}/accept`)
      .set('Authorization', `Bearer ${playerToken3}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/invites/${invite.body.token}/accept`)
      .set('Authorization', `Bearer ${playerToken4}`)
      .expect(410);
  });
});
