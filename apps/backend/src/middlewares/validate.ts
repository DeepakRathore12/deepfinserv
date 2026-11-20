import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/errors';

/** Field errors keyed by path, first message per field. */
export function fieldErrors(
  issues: { path: PropertyKey[]; message: string; code?: string; input?: unknown }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = i.path.map(String).join('.') || '_';
    // Zod's generic messages are written for developers; give people plain ones.
    const msg =
      i.code === 'invalid_type' && i.input === undefined
        ? 'This is required'
        : i.code === 'invalid_value' && i.message.startsWith('Invalid option')
          ? 'Choose one of the options'
          : i.message;
    out[k] ??= msg;
  }
  return out;
}

/** Parse req.body (or query) with a shared Zod schema and replace it with the typed result. */
export function validate(schema: ZodType, where: 'body' | 'query' = 'body'): RequestHandler {
  return (req, res, next) => {
    const r = schema.safeParse(where === 'body' ? req.body : req.query);
    if (!r.success)
      return next(
        new AppError(
          422,
          'validation_failed',
          'Please check the highlighted fields',
          fieldErrors(r.error.issues),
        ),
      );
    // Express 5 makes req.query read-only, so a parsed query is kept on res.locals.
    if (where === 'body') req.body = r.data;
    else (res.locals as Record<string, unknown>).query = r.data;
    next();
  };
}

export function parsedQuery<T>(res: { locals: Record<string, unknown> }): T {
  return res.locals.query as T;
}
