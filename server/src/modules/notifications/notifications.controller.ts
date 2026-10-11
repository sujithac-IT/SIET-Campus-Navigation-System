/**
 * SIET Navigate — Notifications Controller
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { notificationsRepository } from './notifications.repository.js';

export const markReadSchema = z.object({
  notificationId: z.string().min(1, 'notificationId is required'),
});

export const registerDeviceSchema = z.object({
  fcmToken: z.string().min(1, 'fcmToken is required'),
  platform: z.enum(['web', 'android', 'ios']).optional(),
});

export class NotificationsController {
  public async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const notifications = await notificationsRepository.getUserNotifications(userId);
      res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = markReadSchema.parse(req.body);
      await notificationsRepository.markAsRead(parsed.notificationId);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (err) {
      next(err);
    }
  }

  public async registerDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = registerDeviceSchema.parse(req.body);
      const userId = req.user?.id || 'guest-user';
      await notificationsRepository.registerDeviceToken(userId, parsed.fcmToken, parsed.platform);
      res.status(200).json({
        success: true,
        message: 'Device token registered for push notifications',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationsController = new NotificationsController();
