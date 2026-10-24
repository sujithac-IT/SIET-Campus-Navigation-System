/**
 * SIET Navigate — Timetable Express Routes
 */

import { Router } from 'express';
import { timetableController } from './timetable.controller.js';
import { optionalAuth } from '../../core/middleware/auth.middleware.js';

export const timetableRoutes = Router();

/**
 * GET /api/v1/timetable/me
 * Retrieve timetable for authenticated user or guest fallback
 */
timetableRoutes.get('/me', optionalAuth, (req, res, next) => {
  timetableController.getMyTimetable(req, res, next);
});

/**
 * GET /api/v1/timetable/changes
 * Retrieve active timetable slot relocation changes
 */
timetableRoutes.get('/changes', (req, res, next) => {
  timetableController.getChanges(req, res, next);
});

/**
 * POST /api/v1/timetable/changes
 * Create classroom relocation & broadcast real-time event (Faculty & Admin)
 */
timetableRoutes.post('/changes', optionalAuth, (req, res, next) => {
  timetableController.createChange(req, res, next);
});
