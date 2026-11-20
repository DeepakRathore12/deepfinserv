import { z } from 'zod';

const key32 = z
  .string()
  .min(1, 'is required')
  .refine((v) => Buffer.from(v, 'base64').length === 32, 'must be 32 bytes, base64-encoded');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(4000),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().url(),
  DATABASE_SSL: z.enum(['true', 'false']).default('false'),
  DATA_ENCRYPTION_KEY: key32,
  HASH_PEPPER: key32,
  TOKEN_SECRET: key32,
  OTP_PROVIDER: z.enum(['console', 'msg91']).default('console'),
  /** Return the OTP in the /otp/send response, for automated end-to-end tests. Refused in production. */
  OTP_ECHO: z.enum(['true', 'false']).default('false'),
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),
  BUREAU_PROVIDER: z.enum(['none']).default('none'),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(72).default(12),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

/** Validated configuration. The process refuses to start with a missing or malformed value. */
function load() {
  const r = schema.safeParse(process.env);
  if (!r.success) {
    const lines = r.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${lines}`);
  }
  const env = r.data;
  if (env.NODE_ENV === 'production' && env.OTP_PROVIDER === 'console') {
    throw new Error('OTP_PROVIDER=console is not allowed in production');
  }
  if (env.NODE_ENV === 'production' && env.OTP_ECHO === 'true') {
    throw new Error('OTP_ECHO is not allowed in production');
  }
  if (env.OTP_PROVIDER === 'msg91' && (!env.MSG91_AUTH_KEY || !env.MSG91_TEMPLATE_ID)) {
    throw new Error('MSG91_AUTH_KEY and MSG91_TEMPLATE_ID are required when OTP_PROVIDER=msg91');
  }
  return {
    ...env,
    corsOrigins: env.CORS_ORIGINS.split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export const env = load();
export type Env = typeof env;
