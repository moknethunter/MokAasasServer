import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  VERSION: z.string().default('0.1.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  ADMIN_USERNAME: z.string().min(3),
  ADMIN_PASSWORD_HASH: z.string().min(20),
  SESSION_SECRET: z.string().min(32),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(8),
});

const env = schema.parse(process.env);

export const config = {
  ...env,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  features: {
    chat:  process.env.FEATURE_CHAT  === 'true',
    calls: process.env.FEATURE_CALLS === 'true',
    ai:    process.env.FEATURE_AI    === 'true',
    audit: process.env.FEATURE_AUDIT === 'true',
  },
} as const;
