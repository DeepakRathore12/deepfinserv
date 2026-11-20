/** Mirrors the database enums in apps/backend/src/database/migrations. */
export const LEAD_STATUSES = [
  'new',
  'contacted',
  'documents_pending',
  'submitted_to_lender',
  'sanctioned',
  'disbursed',
  'rejected',
  'closed',
] as const;
export const QUEUE_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
