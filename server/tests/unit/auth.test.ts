import { describe, it, expect, vi } from 'vitest';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { config } from '../../src/core/config.js';
import { registerSchema, loginSchema } from '../../src/modules/auth/auth.schema.js';
import {
  authenticateToken,
  optionalAuth,
  requireRole,
  AuthUserPayload,
} from '../../src/core/middleware/auth.middleware.js';
import { UnauthorizedError, ForbiddenError } from '../../src/core/errors.js';
import { AuthService } from '../../src/modules/auth/auth.service.js';

describe('Auth Module — Unit Test Suite', () => {
  describe('1. Password Hashing with Argon2', () => {
    it('should hash a password and verify correctly', async () => {
      const password = 'SietStudent@2026!';
      const hash = await argon2.hash(password);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$argon2')).toBe(true);

      const isValid = await argon2.verify(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await argon2.verify(hash, 'WrongPassword123!');
      expect(isInvalid).toBe(false);
    });
  });

  describe('2. JWT Signing and Token Payload Claims', () => {
    const mockUser = {
      id: 'usr-12345',
      name: 'Aravind Kumar',
      email: 'aravind@siet.ac.in',
      role: Role.STUDENT,
      departmentId: 'dept-cse-01',
      year: 3,
      section: 'A',
      rollNo: '714021104012',
      createdAt: new Date(),
    };

    it('should generate valid access and refresh tokens with correct claims', () => {
      const authService = new AuthService();
      const tokens = authService.generateTokens(mockUser);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      const decodedAccess = jwt.verify(tokens.accessToken, config.JWT_ACCESS_SECRET) as AuthUserPayload;
      expect(decodedAccess.id).toBe(mockUser.id);
      expect(decodedAccess.email).toBe(mockUser.email);
      expect(decodedAccess.role).toBe(Role.STUDENT);
      expect(decodedAccess.rollNo).toBe(mockUser.rollNo);

      const decodedRefresh = jwt.verify(tokens.refreshToken, config.JWT_REFRESH_SECRET) as { id: string };
      expect(decodedRefresh.id).toBe(mockUser.id);
    });

    it('should reject tokens signed with incorrect secrets', () => {
      const forgedToken = jwt.sign({ id: 'fake' }, 'wrong_secret_key_123');
      expect(() => {
        jwt.verify(forgedToken, config.JWT_ACCESS_SECRET);
      }).toThrow();
    });
  });

  describe('3. Zod Input Validation Schemas', () => {
    it('should accept valid registration inputs', () => {
      const validStudent = {
        name: 'Kavya Dharshini',
        email: 'kavya.siet@siet.ac.in',
        password: 'Password@2026',
        role: Role.STUDENT,
        year: 3,
        section: 'A',
        rollNo: '714021104025',
      };

      const result = registerSchema.safeParse(validStudent);
      expect(result.success).toBe(true);
    });

    it('should reject passwords lacking uppercase or digits', () => {
      const weakPasswordUser = {
        name: 'Test Student',
        email: 'test@siet.ac.in',
        password: 'lowercaseonlypassword',
        role: Role.STUDENT,
      };

      const result = registerSchema.safeParse(weakPasswordUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.errors.map((e) => e.message);
        expect(errorMessages.some((msg) => msg.includes('uppercase'))).toBe(true);
      }
    });

    it('should validate login identifiers and passwords', () => {
      const validEmailLogin = { identifier: 'student@siet.ac.in', password: 'Password123!' };
      const validRollLogin = { identifier: '714021104012', password: 'Password123!' };
      const emptyLogin = { identifier: '', password: '' };

      expect(loginSchema.safeParse(validEmailLogin).success).toBe(true);
      expect(loginSchema.safeParse(validRollLogin).success).toBe(true);
      expect(loginSchema.safeParse(emptyLogin).success).toBe(false);
    });
  });

  describe('4. Role Authorization Guard Middleware', () => {
    it('should allow users possessing the authorized role', () => {
      const req = {
        user: { id: 'admin-1', email: 'admin@siet.ac.in', role: Role.ADMIN, name: 'Admin' },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const guard = requireRole(Role.ADMIN);
      guard(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should allow users possessing one of multiple authorized roles', () => {
      const req = {
        user: { id: 'faculty-1', email: 'faculty@siet.ac.in', role: Role.FACULTY, name: 'Faculty' },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const guard = requireRole(Role.ADMIN, Role.FACULTY);
      guard(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should block users with insufficient roles with ForbiddenError', () => {
      const req = {
        user: { id: 'stud-1', email: 'student@siet.ac.in', role: Role.STUDENT, name: 'Student' },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const guard = requireRole(Role.ADMIN);
      guard(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should reject unauthenticated requests with UnauthorizedError', () => {
      const req = {} as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const guard = requireRole(Role.ADMIN);
      guard(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('5. Authentication Middleware', () => {
    it('should authenticate request with valid Bearer token', () => {
      const token = jwt.sign(
        { id: 'usr-1', email: 'user@siet.ac.in', role: Role.STUDENT, name: 'User' },
        config.JWT_ACCESS_SECRET
      );

      const req = {
        headers: { authorization: `Bearer ${token}` },
        cookies: {},
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user?.id).toBe('usr-1');
      expect(next).toHaveBeenCalledWith();
    });

    it('should authenticate request with token stored in cookie', () => {
      const token = jwt.sign(
        { id: 'usr-2', email: 'cookie@siet.ac.in', role: Role.FACULTY, name: 'Faculty Cookie' },
        config.JWT_ACCESS_SECRET
      );

      const req = {
        headers: {},
        cookies: { access_token: token },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      authenticateToken(req, res, next);

      expect(req.user?.role).toBe(Role.FACULTY);
      expect(next).toHaveBeenCalledWith();
    });

    it('should fail with UnauthorizedError if no token is provided', () => {
      const req = { headers: {}, cookies: {} } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should allow anonymous visitors through optionalAuth with user=undefined', () => {
      const req = { headers: {}, cookies: {} } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });
  });
});
