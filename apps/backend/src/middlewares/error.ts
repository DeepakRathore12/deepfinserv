import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../utils/errors';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: 'Not found' } });
};

/** One error shape for every failure. Internal details are logged, never sent. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.fields ? { fields: err.fields } : {}) },
    });
    return;
  }
  const e = err as { type?: string; status?: number };
  if (e.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'bad_json', message: 'The request body is not valid JSON' } });
    return;
  }
  if (e.type === 'entity.too.large') {
    res.status(413).json({ error: { code: 'too_large', message: 'The request is too large' } });
    return;
  }
  req.log?.error({ err }, 'unhandled error');
  res
    .status(500)
    .json({ error: { code: 'internal', message: 'Something went wrong on our side. Please try again.' } });
};
