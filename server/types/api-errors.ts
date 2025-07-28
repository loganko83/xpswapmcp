// API Error Response Types and Helpers

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: number;
    path?: string;
    method?: string;
  };
}

export class ApiErrorResponse {
  static create(
    code: string,
    message: string,
    details?: any,
    req?: any
  ): ApiError {
    return {
      error: {
        code,
        message,
        details,
        timestamp: Date.now(),
        path: req?.path,
        method: req?.method
      }
    };
  }

  // Common error responses
  static badRequest(message: string = 'Bad Request', details?: any): ApiError {
    return this.create('BAD_REQUEST', message, details);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return this.create('UNAUTHORIZED', message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return this.create('FORBIDDEN', message);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return this.create('NOT_FOUND', message);
  }

  static conflict(message: string = 'Conflict', details?: any): ApiError {
    return this.create('CONFLICT', message, details);
  }

  static tooManyRequests(message: string = 'Too many requests'): ApiError {
    return this.create('TOO_MANY_REQUESTS', message);
  }

  static internalError(message: string = 'Internal server error'): ApiError {
    return this.create('INTERNAL_ERROR', message);
  }

  static validationError(errors: any[]): ApiError {
    return this.create('VALIDATION_ERROR', 'Validation failed', errors);
  }
}
