import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z
    .string()
    .default('postgresql://siet_admin:siet_secure_password_2026@localhost:5432/siet_campus_db?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(16).default('siet_super_secret_jwt_access_key_min_32_chars_2026'),
  JWT_REFRESH_SECRET: z.string().min(16).default('siet_super_secret_jwt_refresh_key_min_32_chars_2026'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('siet_cookie_secret_passphrase_2026'),
  ANTHROPIC_API_KEY: z.string().optional().default('mock_anthropic_api_key'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid Environment Variables:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const config = parsed.data;
