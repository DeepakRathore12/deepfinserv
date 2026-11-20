import knex from 'knex';
import { migrationSource } from '../src/database/migrations';

/** Fresh schema for every run: roll everything back, migrate, then seed products and sample lenders. */
export default async function setup() {
  process.env.NODE_ENV = 'test';
  const url = process.env.TEST_DATABASE_URL ?? 'postgres://dk:dk@localhost:5432/dk_test';
  const k = knex({ client: 'pg', connection: url, migrations: { migrationSource } });
  await k.migrate.rollback(undefined, true);
  await k.migrate.latest();
  const { seedProducts, seedSamples } = await import('../src/database/seeds');
  await seedProducts(k);
  await seedSamples(k);
  await k.destroy();
}
