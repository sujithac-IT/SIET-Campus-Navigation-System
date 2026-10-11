/**
 * SIET Navigate — Exams Express Routes
 */

import { Router } from 'express';
import { examsController } from './exams.controller.js';
import { optionalAuth } from '../../core/middleware/auth.middleware.js';

export const examsRoutes = Router();

/**
 * GET /api/v1/exams/my-hall?rollNo=...
 * Lookup exam hall allocation by roll number or authenticated user
 */
examsRoutes.get('/my-hall', optionalAuth, (req, res, next) => {
  examsController.getMyExamHall(req, res, next);
});

/**
 * GET /api/v1/exams
 * Retrieve all campus examinations and hall schedules
 */
examsRoutes.get('/', (req, res, next) => {
  examsController.getAllExams(req, res, next);
});

/**
 * POST /api/v1/exams/hall-changes
 * Shift exam hall & trigger real-time broadcast to roll numbers
 */
examsRoutes.post('/hall-changes', optionalAuth, (req, res, next) => {
  examsController.createChange(req, res, next);
});
