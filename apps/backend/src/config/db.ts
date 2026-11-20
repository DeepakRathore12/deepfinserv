import knex, { type Knex } from 'knex';
import { env } from './env';

export const dbConfig: Knex.Config = {
  client: 'pg',
  connection: {
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : false,
  },
  pool: { min: 2, max: 10, idleTimeoutMillis: 30000 },
  acquireConnectionTimeout: 10000,
};

export const db = knex(dbConfig);
