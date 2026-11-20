import { createInterface } from 'node:readline/promises';
import argon2 from 'argon2';
import { z } from 'zod';
import { db } from '../config/db';

/** Usage: staff:create <email> <name> <admin|agent>. Prompts for the password so it never lands in shell history. */
async function main() {
  const [email, name, role = 'agent'] = process.argv.slice(2);
  const args = z
    .object({ email: z.string().email(), name: z.string().min(2), role: z.enum(['admin', 'agent']) })
    .parse({ email: email?.toLowerCase(), name, role });
  const password = process.env.STAFF_PASSWORD ?? (await ask('Password (min 12 characters): '));
  if (password.length < 12) throw new Error('Password must be at least 12 characters');
  const password_hash = await argon2.hash(password, { type: argon2.argon2id });
  await db('staff_users')
    .insert({ ...args, password_hash, active: true })
    .onConflict('email')
    .merge(['name', 'role', 'password_hash', 'active', 'updated_at']);
  console.log(`Staff user ready: ${args.email} (${args.role})`);
}

async function ask(q: string) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await rl.question(q);
  } finally {
    rl.close();
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
