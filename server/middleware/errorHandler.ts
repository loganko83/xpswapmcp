import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    const message = error.message || 'Internal server error';
    error = new ApiError(message, statusCode, false, err.stack);
  }

  const apiError = error as ApiError;

  // Log error
  if (!apiError.isOperational) {
    console.error('💥 ERROR:', {
      message: apiError.message,
      stack: apiError.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }

  res.status(apiError.statusCode).json({
    success: false,
    error: {
      message: apiError.message,
      ...(process.env.NODE_ENV === 'development' && { stack: apiError.stack })
    }
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `Cannot find ${req.originalUrl}`;
  const error = new ApiError(message, 404);
  next(error);
};
