import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createTestApp, teardownTestApp } from './helpers/test-app';

describe('BDR-011: Notifications (e2e)', () => {
  let app: INestApplication;
  let coachToken: string;
  let playerToken: string;
  let nonMemberToken: string;
  let teamId: string;
  let eventId: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());

    // Register coach
    const r1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'notif-coach@example.com', displayName: 'Notif Coach', password: 'Password1!' });
    coachToken = r1.body.accessToken;

    // Register player
    const r2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'notif-player@example.com', displayName: 'Notif Player', password: 'Password1!' });
    playerToken = r2.body.accessToken;

    // Register non-member
    const r3 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'notif-outsider@example.com',
        displayName: 'Notif Outsider',
        password: 'Password1!',
      });
    nonMemberToken = r3.body.accessToken;

    // Create team (coach is auto-added as COACH member)
    const t = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Notifications Test Team' })
      .expect(201);
    teamId = t.body.id;

    // Add player via invite flow
    const inv = await request(app.getHttpServer())
      .post(`/teams/${teamId}/invites`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ role: 'PLAYER' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/invites/${inv.body.token}/accept`)
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(201);

    // Create an active season (required to create events)
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/seasons`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'Notif Season', startDate: '2026-09-01', endDate: '2026-11-30' })
      .expect(201);

    // Create a GAME event
    const ev = await request(app.getHttpServer())
      .post(`/teams/${teamId}/events`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Championship Game', type: 'GAME', startsAt: '2026-10-15T18:00:00.000Z' })
      .expect(201);
    eventId = ev.body.id;
  });

  afterAll(teardownTestApp);

  // Scenario 1 — Announcement notification fan-out
  it('posting an announcement creates ANNOUNCEMENT_POSTED notification for coach', async () => {
    await request(app.getHttpServer())
      .post(`/teams/${teamId}/announcements`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Big News', body: 'We made the playoffs!', pinned: false })
      .expect(201);

    // EventEmitter2 is synchronous by default in NestJS — no delay needed
    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/notifications`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const notif = res.body.find(
      (n: { type: string; message: string }) => n.type === 'ANNOUNCEMENT_POSTED',
    );
    expect(notif).toBeDefined();
    expect(notif.message).toBe('A new announcement has been posted');
    expect(notif.isRead).toBe(false);
  });

  // Scenario 2 — Event update creates EVENT_UPDATED notification
  it('updating an event creates EVENT_UPDATED notification for coach', async () => {
    await request(app.getHttpServer())
      .patch(`/teams/${teamId}/events/${eventId}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ location: 'City Stadium', version: 0 })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/notifications`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    const notif = res.body.find(
      (n: { type: string }) => n.type === 'EVENT_UPDATED',
    );
    expect(notif).toBeDefined();
    expect(notif.refId).toBe(eventId);
    expect(notif.isRead).toBe(false);
  });

  // Scenario 3 — Mark a single notification as read
  it('PATCH /teams/:teamId/notifications/:id/read marks notification as read', async () => {
    const list = await request(app.getHttpServer())
      .get(`/teams/${teamId}/notifications`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(list.body.length).toBeGreaterThan(0);
    const target = list.body[0];

    const updated = await request(app.getHttpServer())
      .patch(`/teams/${teamId}/notifications/${target.id}/read`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(updated.body.isRead).toBe(true);
    expect(updated.body.id).toBe(target.id);
  });

  // Scenario 4 — Mark all notifications as read
  it('PATCH /teams/:teamId/notifications/read-all marks all as read → 204', async () => {
    await request(app.getHttpServer())
      .patch(`/teams/${teamId}/notifications/read-all`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(204);

    const res = await request(app.getHttpServer())
      .get(`/teams/${teamId}/notifications`)
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    const unread = res.body.filter((n: { isRead: boolean }) => !n.isRead);
    expect(unread).toHaveLength(0);
  });

  // Scenario 5 — Non-member cannot access notifications → 403
  it('non-member receives 403 on GET /teams/:teamId/notifications', async () => {
    await request(app.getHttpServer())
      .get(`/teams/${teamId}/notifications`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .expect(403);
  });
});
