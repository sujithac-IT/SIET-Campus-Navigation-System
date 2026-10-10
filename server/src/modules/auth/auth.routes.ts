import { Router } from 'express';
import { authController } from './auth.controller.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema.js';
import { validate } from '../../core/middleware/validate.middleware.js';
import { authenticateToken } from '../../core/middleware/auth.middleware.js';

const router = Router();

router.post('/register', validate({ body: registerSchema }), (req, res, next) => {
  authController.register(req, res, next);
});

router.post('/login', validate({ body: loginSchema }), (req, res, next) => {
  authController.login(req, res, next);
});

router.post('/refresh', validate({ body: refreshSchema }), (req, res, next) => {
  authController.refresh(req, res, next);
});

router.get('/me', authenticateToken, (req, res, next) => {
  authController.me(req, res, next);
});

router.post('/logout', (req, res) => {
  authController.logout(req, res);
});

export const authRoutes = router;
