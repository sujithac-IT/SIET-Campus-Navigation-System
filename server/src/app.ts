import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './core/config.js';
import { logger } from './core/logger.js';
import { errorHandler } from './core/middleware/errorHandler.js';
import { NotFoundError } from './core/errors.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { placesRoutes } from './modules/places/places.routes.js';
import { buildingsRoutes } from './modules/places/buildings.routes.js';
import { routingRoutes } from './modules/routing/routing.routes.js';
import { timetableRoutes } from './modules/timetable/timetable.routes.js';
import { examsRoutes } from './modules/exams/exams.routes.js';
import { notificationsRoutes, devicesRoutes } from './modules/notifications/notifications.routes.js';
import { assistantRoutes } from './modules/assistant/assistant.routes.js';
import { setupSwagger } from './core/swagger.js';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet({ contentSecurityPolicy: false })); // allow Swagger UI assets

  // CORS Configuration
  app.use(
    cors({
      origin: [config.CLIENT_URL, 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body and Cookie Parsers
  app.use(express.json());
  app.use(cookieParser(config.COOKIE_SECRET));

  // Swagger OpenAPI Documentation
  setupSwagger(app);

  // Request logger middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (process.env['NODE_ENV'] !== 'test') {
      logger.info(`[HTTP] ${req.method} ${req.path}`);
    }
    next();
  });

  // Healthcheck endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'SIET Navigate Backend API',
      version: '1.0.0',
    });
  });

  // API v1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/places', placesRoutes);
  app.use('/api/v1/buildings', buildingsRoutes);
  app.use('/api/v1/route', routingRoutes);
  app.use('/route', routingRoutes);
  app.use('/api/v1/timetable', timetableRoutes);
  app.use('/api/v1/exams', examsRoutes);
  app.use('/api/v1/notifications', notificationsRoutes);
  app.use('/api/v1/devices', devicesRoutes);
  app.use('/api/v1/assistant', assistantRoutes);

  // 404 Not Found Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
