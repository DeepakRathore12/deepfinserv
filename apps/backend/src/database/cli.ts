import knex from 'knex';
import { dbConfig } from '../config/db';
import { env } from '../config/env';
import { migrationSource } from './migrations';
import { seedProducts, seedSamples } from './seeds';

/** Usage: cli migrate | rollback | seed [--samples] | status */
async function main() {
  const [cmd, ...flags] = process.argv.slice(2);
  const k = knex({ ...dbConfig, migrations: { migrationSource, tableName: 'knex_migrations' } });
  try {
    if (cmd === 'migrate') {
      const [batch, names] = await k.migrate.latest();
      console.log(names.length ? `Batch ${batch}: ${names.join(', ')}` : 'Already up to date');
    } else if (cmd === 'rollback') {
      const [batch, names] = await k.migrate.rollback();
      console.log(names.length ? `Rolled back batch ${batch}: ${names.join(', ')}` : 'Nothing to roll back');
    } else if (cmd === 'status') {
      const [done, pending] = await k.migrate.list();
      console.log({
        done: done.map((d: { name: string }) => d.name),
        pending: pending.map((p: { file: string }) => p.file),
      });
    } else if (cmd === 'seed') {
      console.log(`Products: ${await seedProducts(k)}`);
      if (flags.includes('--samples')) {
        if (env.NODE_ENV === 'production') throw new Error('Sample lenders cannot be seeded in production');
        console.log(`Sample rate cards: ${await seedSamples(k)}`);
      }
    } else {
      console.log('Usage: cli migrate | rollback | status | seed [--samples]');
      process.exitCode = 1;
    }
  } finally {
    await k.destroy();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
