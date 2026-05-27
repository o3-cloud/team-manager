import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { AnnouncementPostedEvent } from '../announcements/announcements.service';
import {
  EventCancelledEvent,
  EventReinstatedEvent,
  EventUpdatedEvent,
} from '../events/events.service';
import { MembershipEntity } from '../memberships/entities/membership.entity';
import { NotificationEntity, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    @InjectRepository(MembershipEntity)
    private readonly membershipRepo: Repository<MembershipEntity>,
  ) {}

  async findForUser(userId: string, teamId: string): Promise<NotificationEntity[]> {
    return this.notificationRepo.find({
      where: { userId, teamId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markRead(userId: string, teamId: string, id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepo.findOneBy({ id, userId, teamId });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  async markAllRead(userId: string, teamId: string): Promise<void> {
    await this.notificationRepo.update({ userId, teamId, isRead: false }, { isRead: true });
  }

  @OnEvent('event.updated')
  async onEventUpdated(payload: EventUpdatedEvent): Promise<void> {
    await this.fanOut(
      payload.teamId,
      NotificationType.EVENT_UPDATED,
      payload.event.id,
      `Event "${payload.event.title}" has been updated`,
    );
  }

  @OnEvent('event.cancelled')
  async onEventCancelled(payload: EventCancelledEvent): Promise<void> {
    await this.fanOut(
      payload.teamId,
      NotificationType.EVENT_CANCELLED,
      payload.event.id,
      `Event "${payload.event.title}" has been cancelled`,
    );
  }

  @OnEvent('event.reinstated')
  async onEventReinstated(payload: EventReinstatedEvent): Promise<void> {
    await this.fanOut(
      payload.teamId,
      NotificationType.EVENT_REINSTATED,
      payload.event.id,
      `Event "${payload.event.title}" has been reinstated`,
    );
  }

  @OnEvent('announcement.posted')
  async onAnnouncementPosted(payload: AnnouncementPostedEvent): Promise<void> {
    await this.fanOut(
      payload.teamId,
      NotificationType.ANNOUNCEMENT_POSTED,
      payload.announcementId,
      'A new announcement has been posted',
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async pruneOldNotifications(): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    await this.notificationRepo.delete({ isRead: true, createdAt: LessThan(cutoff) });
  }

  private async fanOut(
    teamId: string,
    type: NotificationType,
    refId: string,
    message: string,
  ): Promise<void> {
    const memberships = await this.membershipRepo.findBy({ teamId });
    const notifications = memberships.map((m) =>
      this.notificationRepo.create({
        userId: m.userId,
        teamId,
        type,
        refId,
        message,
        isRead: false,
      }),
    );
    await this.notificationRepo.save(notifications);
  }
}
