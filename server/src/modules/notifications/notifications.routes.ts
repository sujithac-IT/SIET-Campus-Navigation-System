/**
 * SIET Navigate — Notifications & Devices Express Routes
 */

import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { optionalAuth } from '../../core/middleware/auth.middleware.js';

export const notificationsRoutes = Router();
export const devicesRoutes = Router();

/**
 * GET /api/v1/notifications
 * Retrieve notification history and unread count
 */
notificationsRoutes.get('/', optionalAuth, (req, res, next) => {
  notificationsController.getNotifications(req, res, next);
});

/**
 * POST /api/v1/notifications/read
 * Mark notification as read
 */
notificationsRoutes.post('/read', optionalAuth, (req, res, next) => {
  notificationsController.markRead(req, res, next);
});

/**
 * POST /api/v1/devices/register
 * Register FCM device token
 */
devicesRoutes.post('/register', optionalAuth, (req, res, next) => {
  notificationsController.registerDevice(req, res, next);
});
