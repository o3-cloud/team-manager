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

describe('BDR-004: Roster Management (e2e)', () => {
  let app: INestApplication;
  let coachToken: string;
  let coachUserId: string;
  let nonMemberToken: string;
  let teamId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    const r1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'roster-coach@example.com', displayName: 'Roster Coach', password: 'Password1!' });
    coachToken = r1.body.accessToken;
    coachUserId = r1.body.user.id;

    const r2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'roster-nonmember@example.com', displayName: 'Non Member', password: 'Password1!' });
    nonMemberToken = r2.body.accessToken;

    const t = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Roster Test Team' })
      .expect(201);
    teamId = t.body.id;
  });

  afterAll(teardownTestApp);

  // Scenario 1 — Add player
  it('coach can add a player to the roster', async () => {
    const res = await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ displayName: 'Jane Doe', jerseyNumber: '10', position: 'Forward' })
      .expect(201);

    expect(res.body.displayName).toBe('Jane Doe');
    expect(res.body.jerseyNumber).toBe('10');

    const roster = await request(app.getHttpServer())
      .get(`/teams/${teamId}/roster`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(roster.body.some((e: { displayName: string }) => e.displayName === 'Jane Doe')).toBe(true);
  });

  // Scenario 2 — Update player details
  it('coach can update a roster entry', async () => {
    const add = await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ displayName: 'John Smith', jerseyNumber: '7' })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/teams/${teamId}/roster/${add.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ jerseyNumber: '99' })
      .expect(200);

    expect(updated.body.jerseyNumber).toBe('99');
  });

  // Scenario 3 — Link parent to player (parent must be PARENT-role member via invite)
  it('coach can link a PARENT-role member to a roster entry', async () => {
    const parentReg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'roster-parent2@example.com', displayName: 'Roster Parent 2', password: 'Password1!' });
    const parentUserId = parentReg.body.user.id;
    const parentToken = parentReg.body.accessToken;

    // Parent must join team with PARENT role first
    await inviteAndAccept(app, teamId, coachToken, parentToken, 'PARENT');

    const add = await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ displayName: 'Kid Player' })
      .expect(201);

    const link = await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster/${add.body.id}/parents`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ parentUserId })
      .expect(201);

    expect(link.body.parentUserId).toBe(parentUserId);
    expect(link.body.rosterEntryId).toBe(add.body.id);
  });

  // R08 negative — linking a non-PARENT-member is rejected
  it('cannot link a user who is not a PARENT-role team member', async () => {
    const strangerReg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'roster-stranger@example.com', displayName: 'Stranger', password: 'Password1!' });
    const strangerId = strangerReg.body.user.id;

    const add = await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ displayName: 'Another Kid' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster/${add.body.id}/parents`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ parentUserId: strangerId })
      .expect(403);
  });

  // Scenario 4 — Duplicate parent link rejected
  it('duplicate parent link is rejected', async () => {
    const parentReg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'roster-parent3@example.com', displayName: 'Roster Parent 3', password: 'Password1!' });
    const parentUserId = parentReg.body.user.id;
    const parentToken2 = parentReg.body.accessToken;

    await inviteAndAccept(app, teamId, coachToken, parentToken2, 'PARENT');

    const add = await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ displayName: 'Linked Kid' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster/${add.body.id}/parents`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ parentUserId })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster/${add.body.id}/parents`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ parentUserId })
      .expect(409);
  });

  // Non-member cannot access roster
  it('non-member gets 403 on roster endpoints', async () => {
    await request(app.getHttpServer())
      .get(`/teams/${teamId}/roster`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .expect(403);
  });

  // AC-6 / FR-1d — PATCH can set userId (H-6 fix)
  it('coach can patch a roster entry to set userId', async () => {
    const add = await request(app.getHttpServer())
      .post(`/teams/${teamId}/roster`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ displayName: 'User Link Test' })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/teams/${teamId}/roster/${add.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ userId: coachUserId })
      .expect(200);

    expect(updated.body.userId).toBe(coachUserId);
  });

  // BL-1 — Malformed entryId on PATCH returns 400 (AC-8)
  it('returns 400 for malformed entryId on PATCH /teams/:teamId/roster/:entryId', async () => {
    await request(app.getHttpServer())
      .patch(`/teams/${teamId}/roster/not-a-uuid`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ playerName: 'Test', position: 'Forward' })
      .expect(400);
  });
});
