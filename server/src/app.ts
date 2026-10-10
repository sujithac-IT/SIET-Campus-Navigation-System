import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './core/config.js';
import { logger } from './core/logger.js';
import { errorHandler } from './core/middleware/errorHandler.js';
import { NotFoundError } from './core/errors.js';
import { authRoutes } from './modules/auth/auth.routes.js';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet());

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

  // 404 Not Found Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
