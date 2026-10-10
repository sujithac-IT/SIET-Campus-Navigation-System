import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../errors.js';
import { config } from '../config.js';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
  departmentId?: string | null;
  year?: number | null;
  section?: string | null;
  rollNo?: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (req.cookies && req.cookies['access_token']) {
    return req.cookies['access_token'];
  }
  return null;
}

export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    return next(new UnauthorizedError('Authentication token is required'));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Authentication token has expired'));
    }
    return next(new UnauthorizedError('Invalid authentication token'));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as AuthUserPayload;
    req.user = decoded;
  } catch {
    // If optional auth fails, proceed as unauthenticated visitor
    req.user = undefined;
  }
  next();
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Requires one of roles: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}
