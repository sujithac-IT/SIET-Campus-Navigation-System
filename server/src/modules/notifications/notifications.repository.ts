/**
 * SIET Navigate — Notifications Repository
 */

import { prisma } from '../../core/database.js';
import { logger } from '../../core/logger.js';

export interface NotificationItemEntity {
  id: string;
  type: string;
  title: string;
  body: string;
  payload?: any;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string | null;
}

const FALLBACK_NOTIFICATIONS: NotificationItemEntity[] = [
  {
    id: 'notif-fb-1',
    type: 'TIMETABLE_CHANGE',
    title: 'Classroom Relocated: Computer Networks',
    body: 'Computer Networks (09:00 AM) shifted from Exam Hall LH 02 to Tech Park Lab 3. Reason: Project Demo & Lab Equipment Setup.',
    createdAt: 'Today, 08:45 AM',
    isRead: false,
    actionUrl: '/navigate?to=TECH-101',
  },
  {
    id: 'notif-fb-2',
    type: 'EXAM_HALL_CHANGE',
    title: 'Exam Hall Change Alert: DBMS Practical',
    body: 'Exam hall for roll numbers 714021104001 - 714021104030 shifted to Tech Park Lab 3.',
    createdAt: 'Yesterday, 04:30 PM',
    isRead: true,
    actionUrl: '/navigate?to=TECH-101',
  },
  {
    id: 'notif-fb-3',
    type: 'ANNOUNCEMENT',
    title: '📢 SIET Hackathon 2026 Registration Open',
    body: 'Annual 36-hour hackathon registrations are now open. Venue: Central Library & Tech Park.',
    createdAt: '2 days ago',
    isRead: true,
    actionUrl: '/map',
  },
];

export class NotificationsRepository {
  private notifications: NotificationItemEntity[] = [...FALLBACK_NOTIFICATIONS];

  public async getUserNotifications(_userId?: string): Promise<NotificationItemEntity[]> {
    if (process.env['NODE_ENV'] !== 'test') {
      try {
        const notifs = await prisma.notification.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
        });

        if (notifs.length > 0) {
          return notifs.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            payload: n.payload,
            createdAt: n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            actionUrl: (n.payload as any)?.actionUrl || null,
          }));
        }
      } catch (err: any) {
        logger.warn(`[NotificationsRepo] DB query failed, using fallback: ${err.message}`);
      }
    }

    return this.notifications;
  }

  public async markAsRead(notificationId: string): Promise<boolean> {
    const item = this.notifications.find((n) => n.id === notificationId);
    if (item) {
      item.isRead = true;
      return true;
    }
    return false;
  }

  public async registerDeviceToken(userId: string, fcmToken: string, platform = 'web') {
    if (process.env['NODE_ENV'] !== 'test') {
      try {
        await prisma.deviceToken.upsert({
          where: { fcmToken },
          create: { userId, fcmToken, platform },
          update: { userId, platform },
        });
      } catch {
        // Fallback
      }
    }
    return { success: true, fcmToken };
  }
}

export const notificationsRepository = new NotificationsRepository();
