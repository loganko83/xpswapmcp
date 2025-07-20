import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import helmet from 'helmet';

// Rate limiting configurations
export const rateLimiters = {
  // General API rate limit
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  }),

  // Strict rate limit for sensitive operations
  strict: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many requests for this operation, please try again later.',
  }),

  // Trading operations rate limit
  trading: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 trades per minute
    message: 'Trading rate limit exceeded, please slow down.',
  }),
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.coingecko.com", "https://pro-api.coinmarketcap.com"],
    },
  },
});

// Input validation rules
export const validators = {
  // Swap validation
  swap: [
    body('from').isString().isLength({ min: 2, max: 10 }),
    body('to').isString().isLength({ min: 2, max: 10 }),
    body('amount').isNumeric().custom((value) => {
      const num = parseFloat(value);
      return num > 0 && num <= 1000000; // Max 1M tokens per swap
    }),
    body('slippage').optional().isFloat({ min: 0.1, max: 50 }), // 0.1% to 50%
  ],

  // Pool operations validation
  pool: [
    body('tokenA').isString().isLength({ min: 2, max: 10 }),
    body('tokenB').isString().isLength({ min: 2, max: 10 }),
    body('amountA').isNumeric().custom((value) => {
      const num = parseFloat(value);
      return num > 0 && num <= 1000000;
    }),
    body('amountB').isNumeric().custom((value) => {
      const num = parseFloat(value);
      return num > 0 && num <= 1000000;
    }),
  ],

  // Options trading validation
  options: [
    body('underlying').isString().isLength({ min: 2, max: 10 }),
    body('strike').isNumeric().custom((value) => {
      const num = parseFloat(value);
      return num > 0 && num <= 1000000;
    }),
    body('expiry').isISO8601(),
    body('type').isIn(['call', 'put']),
    body('amount').isNumeric().custom((value) => {
      const num = parseFloat(value);
      return num > 0 && num <= 10000;
    }),
  ],

  // Futures trading validation
  futures: [
    body('symbol').isString().isLength({ min: 2, max: 20 }),
    body('size').isNumeric().custom((value) => {
      const num = parseFloat(value);
      return num > 0 && num <= 100000;
    }),
    body('leverage').isInt({ min: 1, max: 125 }),
    body('side').isIn(['long', 'short']),
  ],

  // Flash loan validation
  flashLoan: [
    body('token').isString().isLength({ min: 2, max: 10 }),
    body('amount').isNumeric().custom((value) => {
      const num = parseFloat(value);
      return num >= 100 && num <= 10000000; // $100 - $10M
    }),
    body('callback').isString().isLength({ max: 10000 }), // Max 10KB code
    body('strategy').isIn(['arbitrage', 'liquidation', 'collateral_swap']),
    body('address').isEthereumAddress(),
  ],

  // Price query validation
  priceQuery: [
    param('symbol').optional().isString().isLength({ min: 2, max: 10 }),
    query('symbols').optional().isString(),
  ],

  // Address validation
  address: [
    param('address').isEthereumAddress(),
  ],
};

// Validation error handler
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
}

// SQL injection prevention middleware
export function preventSQLInjection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const suspicious = /(\b(union|select|insert|update|delete|drop|create|alter|exec|script)\b)|(-{2})|(\|{2})|(;)/gi;
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return !suspicious.test(value);
    }
    return true;
  };

  // Check all request inputs
  const allInputs = { ...req.body, ...req.query, ...req.params };
  
  for (const [key, value] of Object.entries(allInputs)) {
    if (!checkValue(value)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input detected',
      });
    }
  }
  
  next();
}

// XSS prevention middleware
export function preventXSS(req: Request, res: Response, next: NextFunction) {
  const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  
  const sanitize = (value: any): any => {
    if (typeof value === 'string') {
      return value.replace(xssPattern, '').replace(/[<>]/g, '');
    }
    return value;
  };

  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitize(req.body[key]);
    });
  }
  
  next();
}

// Utility function to sanitize SQL input
export function sanitizeSQLInput(input: string): string {
  // Remove common SQL injection patterns
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments
    .replace(/\*\//g, '')
    .replace(/;/g, '') // Remove semicolons
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|script)\b/gi, ''); // Remove SQL keywords
}

// Utility function to sanitize HTML input
export function sanitizeHTMLInput(input: string): string {
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Error handler middleware
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('API Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString(),
  });
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
}