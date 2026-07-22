import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(`[Error] ${err.message}`);
  console.error(err.stack);

  if (err.message.includes('not found')) {
    sendError(res, err.message, 404);
    return;
  }

  if (err.message.includes('Invalid') || err.message.includes('required')) {
    sendError(res, err.message, 400);
    return;
  }

  sendError(res, 'Internal server error', 500);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404);
}
