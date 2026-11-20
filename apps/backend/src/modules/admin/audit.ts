import { db } from '../../config/db';

/** Append-only record of staff actions, including every view of decrypted personal data. */
export async function audit(
  staffId: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  meta?: Record<string, unknown>,
) {
  await db('audit_log').insert({
    staff_id: staffId,
    action,
    entity,
    entity_id: entityId,
    meta: meta ? JSON.stringify(meta) : null,
  });
}
