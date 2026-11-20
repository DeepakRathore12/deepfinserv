/** An error safe to show the client: code, message and optional field messages. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export const notFound = (what = 'Resource') => new AppError(404, 'not_found', `${what} not found`);
export const unauthorized = (msg = 'Your session has expired. Please start again.') =>
  new AppError(401, 'unauthorized', msg);
export const forbidden = () => new AppError(403, 'forbidden', 'You do not have access to this');
export const tooMany = (msg = 'Too many attempts. Please wait a few minutes and try again.') =>
  new AppError(429, 'rate_limited', msg);
