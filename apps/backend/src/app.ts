import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { db } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';
import { sameOrigin } from './middlewares/auth';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { apiLimiter } from './middlewares/rate-limit';
import { adminRouter } from './modules/admin/routes';
import { publicRouter } from './modules/public/routes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // One proxy hop (Nginx) in front, so req.ip is the real client address for rate limits.
  app.set('trust proxy', 1);
  app.use(
    helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } } }),
  );
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/v1/health' } }));
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.get('/api/v1/health', async (_req, res) => {
    try {
      await db.raw('select 1');
      res.json({ status: 'ok' });
    } catch {
      res.status(503).json({ status: 'degraded' });
    }
  });

  app.use('/api/v1', apiLimiter);
  app.use('/api/v1/admin', sameOrigin(env.corsOrigins), adminRouter);
  app.use('/api/v1', publicRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
