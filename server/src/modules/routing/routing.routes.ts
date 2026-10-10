import { Router } from 'express';
import { routingController } from './routing.controller.js';
import { routeRequestSchema } from './routing.schema.js';
import { validate } from '../../core/middleware/validate.middleware.js';
import { authenticateToken, requireRole } from '../../core/middleware/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

// POST /api/v1/route and POST /route (unauthenticated visitors welcome)
router.post('/', validate({ body: routeRequestSchema }), (req, res, next) => {
  routingController.computeRoute(req, res, next);
});

// POST /api/v1/route/invalidate (admin only)
router.post('/invalidate', authenticateToken, requireRole(Role.ADMIN), (req, res, next) => {
  routingController.invalidateCache(req, res, next);
});

export const routingRoutes = router;
