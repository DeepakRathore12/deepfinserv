import { createApp } from './app';
import { db } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';

const server = createApp().listen(env.PORT, () => logger.info({ port: env.PORT }, 'API listening'));

/** Finish in-flight requests, then close the pool. PM2 sends SIGINT on reload. */
function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await db.destroy();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
