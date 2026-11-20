import type { Knex } from 'knex';
import * as m001 from './001_core';
import * as m002 from './002_customers';
import * as m003 from './003_leads';
import * as m004 from './004_requests';
import * as m005 from './005_lender_logos';

/**
 * Migrations are imported statically so the bundled server can run them without a migrations folder on disk.
 * Add new migrations to this list in order. Never edit one that has run in production.
 */
const list: Array<[string, Knex.Migration]> = [
  ['001_core', m001],
  ['002_customers', m002],
  ['003_leads', m003],
  ['004_requests', m004],
  ['005_lender_logos', m005],
];

export const migrationSource: Knex.MigrationSource<Knex.Migration> = {
  getMigrations: async () => list.map(([, m]) => m),
  getMigrationName: (m) => list.find(([, x]) => x === m)![0],
  getMigration: async (m) => m,
};
