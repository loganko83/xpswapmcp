// Missing exports for backward compatibility
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// SQL Input sanitization
export const sanitizeSQLInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  // Remove common SQL injection patterns
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .replace(/xp_cmdshell/gi, '') // Remove dangerous functions
    .replace(/sp_/gi, '') // Remove stored procedure calls
    .trim();
};

// Common validators
export const validators = {
  // Address validation
  address: body('address')
    .isLength({ min: 42, max: 42 })
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address'),
    
  // Amount validation
  amount: body('amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
    
  // Token address validation
  tokenAddress: body('tokenAddress')
    .optional()
    .isLength({ min: 42, max: 42 })
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid token address'),
    
  // Slippage validation
  slippage: body('slippage')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Slippage must be between 0 and 50'),
    
  // Email validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
    
  // Swap validation
  swap: [
    body('tokenIn')
      .isLength({ min: 42, max: 42 })
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid tokenIn address'),
    body('tokenOut')
      .isLength({ min: 42, max: 42 })
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid tokenOut address'),
    body('amountIn')
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('AmountIn must be a positive number'),
    body('slippage')
      .optional()
      .isFloat({ min: 0, max: 50 })
      .withMessage('Slippage must be between 0 and 50')
  ],
    
  // General string validation
  string: (field: string, options: { min?: number, max?: number } = {}) =>
    body(field)
      .isString()
      .trim()
      .isLength({ min: options.min || 1, max: options.max || 255 })
      .withMessage(`${field} must be a string between ${options.min || 1} and ${options.max || 255} characters`)
};

// Export rate limiters for backward compatibility
export const rateLimiters = {
  // General API rate limiter
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  },
  
  // Strict rate limiter for sensitive operations
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many requests for this operation'
  },
  
  // Trading operations rate limiter
  trading: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // limit each IP to 50 trading requests per windowMs
    message: 'Too many trading requests'
  }
};
