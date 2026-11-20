import pino from 'pino';
import { env } from './env';

/** JSON logs with personal data redacted at the source. */
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.mobile',
      '*.pan',
      '*.code',
      '*.password',
      '*.verificationToken',
      '*.leadToken',
      '*.email',
      '*.fullName',
      '*.dob',
    ],
    censor: '[redacted]',
  },
});
