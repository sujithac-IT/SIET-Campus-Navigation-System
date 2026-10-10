import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';
import { config } from '../../core/config.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../core/errors.js';
import { AuthRepository, authRepository } from './auth.repository.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { AuthUserPayload } from '../../core/middleware/auth.middleware.js';

export interface UserSanitized {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string | null;
  year?: number | null;
  section?: string | null;
  rollNo?: string | null;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserSanitized;
  tokens: AuthTokens;
}

export class AuthService {
  constructor(private repo: AuthRepository = authRepository) {}

  public sanitizeUser(user: User): UserSanitized {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      year: user.year,
      section: user.section,
      rollNo: user.rollNo,
      createdAt: user.createdAt,
    };
  }

  public generateTokens(user: UserSanitized): AuthTokens {
    const payload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      departmentId: user.departmentId,
      year: user.year,
      section: user.section,
      rollNo: user.rollNo,
    };

    const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign({ id: user.id }, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingEmail = await this.repo.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError('User with this email already exists');
    }

    if (input.rollNo) {
      const existingRoll = await this.repo.findByRollNo(input.rollNo);
      if (existingRoll) {
        throw new ConflictError('User with this roll number already exists');
      }
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await this.repo.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      year: input.year,
      section: input.section,
      rollNo: input.rollNo,
      ...(input.departmentId ? { department: { connect: { id: input.departmentId } } } : {}),
    });

    const sanitized = this.sanitizeUser(user);
    const tokens = this.generateTokens(sanitized);

    return { user: sanitized, tokens };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const isEmail = input.identifier.includes('@');
    const user = isEmail
      ? await this.repo.findByEmail(input.identifier)
      : await this.repo.findByRollNo(input.identifier);

    if (!user) {
      throw new UnauthorizedError('Invalid email/roll number or password');
    }

    const isValidPassword = await argon2.verify(user.passwordHash, input.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email/roll number or password');
    }

    const sanitized = this.sanitizeUser(user);
    const tokens = this.generateTokens(sanitized);

    return { user: sanitized, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { id: string };
      const user = await this.repo.findById(decoded.id);

      if (!user) {
        throw new UnauthorizedError('User account not found');
      }

      const sanitized = this.sanitizeUser(user);
      return this.generateTokens(sanitized);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async getCurrentUser(userId: string): Promise<UserSanitized> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
