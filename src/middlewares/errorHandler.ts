import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  code?: number;
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
};