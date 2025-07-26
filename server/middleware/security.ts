import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';

// 🔒 Enhanced Security Configuration
export const securityConfig = {
  MAX_DAILY_VOLUME: 1000000, // $1M daily volume limit
  MIN_TRADE_INTERVAL: 1000, // 1 second minimum between trades
  PRICE_VALIDITY_PERIOD: 5 * 60 * 1000, // 5 minutes
  MAX_PRICE_DEVIATION: 500, // 5% maximum price deviation
  FLASH_LOAN_COOLDOWN: 10 * 60 * 1000, // 10 minutes cooldown
  MAX_FLASH_LOAN_AMOUNT: 10000000, // $10M maximum flash loan
  NONCE_EXPIRY: 15 * 60 * 1000, // 15 minutes nonce validity
};

// 🛡️ Enhanced Rate Limiting
export const rateLimiters = {
  // General API rate limit - Enhanced
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      error: 'Too many requests from this IP',
      retryAfter: '15 minutes',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn('🚨 Rate limit exceeded:', {
        ip: req.ip,
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: '15 minutes'
      });
    }
  }),

  // Trading operations - Stricter limits
  trading: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Reduced from 30 to 10
    message: {
      error: 'Too many trading requests',
      retryAfter: '1 minute',
      code: 'TRADING_RATE_LIMIT'
    },
    handler: (req, res) => {
      console.warn('🚨 Trading rate limit exceeded:', {
        ip: req.ip,
        path: req.path,
        timestamp: new Date().toISOString()
      });
      res.status(429).json({
        error: 'Trading rate limit exceeded',
        retryAfter: '1 minute'
      });
    }
  }),

  // High-risk operations (Flash loans, large trades)
  highRisk: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Only 3 high-risk operations per 15 minutes
    message: {
      error: 'Too many high-risk operations',
      retryAfter: '15 minutes',
      code: 'HIGH_RISK_RATE_LIMIT'
    }
  }),

  // Options and Futures trading
  derivatives: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 derivative trades per 5 minutes
    message: {
      error: 'Too many derivatives trading requests',
      retryAfter: '5 minutes',
      code: 'DERIVATIVES_RATE_LIMIT'
    }
  })
};

// 🛡️ Enhanced CORS Configuration
export const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? ['https://trendy.storydot.kr', 'https://xpswap.com']
      : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('🚨 CORS violation:', { origin, timestamp: new Date().toISOString() });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-API-Key',
    'X-Nonce',
    'X-Signature'
  ],
  maxAge: 86400 // 24 hours
};

// 🛡️ Enhanced Security Headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: process.env.NODE_ENV === 'development' 
        ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"]
        : ["'self'", "https:"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: [
        "'self'", 
        "https:",
        "wss:",
        "ws://localhost:*",
        "http://localhost:*",
        "https://api.coingecko.com",
        "https://pro-api.coinmarketcap.com"
      ],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
});

// 🔐 Cryptographically Secure Random Number Generation
export function generateSecureNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateSecureTransactionHash(): string {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return crypto.createHash('sha256').update(timestamp + randomBytes).digest('hex');
}

// 🛡️ Enhanced Input Validation
export const validators = {
  // Enhanced swap validation with security checks
  swap: [
    body('from').isString().isLength({ min: 2, max: 10 })
      .matches(/^[A-Z0-9]+$/).withMessage('Invalid token symbol format'),
    body('to').isString().isLength({ min: 2, max: 10 })
      .matches(/^[A-Z0-9]+$/).withMessage('Invalid token symbol format'),
    body('amount').isNumeric().custom((value) => {
      const num = parseFloat(value);
      if (num <= 0) throw new Error('Amount must be positive');
      if (num > 1000000) throw new Error('Amount exceeds maximum limit');
      return true;
    }),
    body('slippage').optional().isFloat({ min: 0.1, max: 50 })
      .withMessage('Slippage must be between 0.1% and 50%'),
    body('deadline').optional().isInt({ min: Date.now() })
      .withMessage('Deadline must be in the future'),
    body('nonce').optional().isString().isLength({ min: 32, max: 64 })
      .withMessage('Invalid nonce format'),
  ],

  // Enhanced Options validation
  options: [
    body('underlying').isString().isLength({ min: 2, max: 10 })
      .matches(/^[A-Z0-9]+$/).withMessage('Invalid underlying asset'),
    body('strike').isNumeric().custom((value) => {
      const num = parseFloat(value);
      if (num <= 0) throw new Error('Strike price must be positive');
      if (num > 1000000) throw new Error('Strike price too high');
      return true;
    }),
    body('expiry').isISO8601().custom((value) => {
      const expiry = new Date(value);
      const now = new Date();
      const maxExpiry = new Date();
      maxExpiry.setFullYear(maxExpiry.getFullYear() + 1);
      
      if (expiry <= now) throw new Error('Expiry must be in the future');
      if (expiry > maxExpiry) throw new Error('Expiry cannot exceed 1 year');
      return true;
    }),
    body('type').isIn(['call', 'put']).withMessage('Option type must be call or put'),
    body('amount').isNumeric().custom((value) => {
      const num = parseFloat(value);
      if (num <= 0) throw new Error('Amount must be positive');
      if (num > 10000) throw new Error('Amount exceeds maximum contracts');
      return true;
    }),
    body('premium').isNumeric().custom((value) => {
      const num = parseFloat(value);
      if (num < 0) throw new Error('Premium cannot be negative');
      return true;
    }),
  ],

  // Enhanced Flash Loan validation
  flashLoan: [
    body('token').isString().isLength({ min: 2, max: 10 })
      .matches(/^[A-Z0-9]+$/).withMessage('Invalid token symbol'),
    body('amount').isNumeric().custom((value) => {
      const num = parseFloat(value);
      if (num < 100) throw new Error('Minimum flash loan amount is $100');
      if (num > securityConfig.MAX_FLASH_LOAN_AMOUNT) {
        throw new Error('Flash loan amount exceeds maximum limit');
      }
      return true;
    }),
    body('strategy').isIn(['arbitrage', 'liquidation', 'collateral_swap'])
      .withMessage('Invalid flash loan strategy'),
    body('recipient').isEthereumAddress()
      .withMessage('Invalid recipient address'),
    body('callback').isString().isLength({ max: 10000 })
      .withMessage('Callback code too large'),
    body('nonce').isString().isLength({ min: 32, max: 64 })
      .withMessage('Invalid nonce'),
  ],

  // Enhanced Futures validation
  futures: [
    body('symbol').isString().isLength({ min: 2, max: 20 })
      .matches(/^[A-Z0-9\-\/]+$/).withMessage('Invalid futures symbol'),
    body('size').isNumeric().custom((value) => {
      const num = parseFloat(value);
      if (num <= 0) throw new Error('Position size must be positive');
      if (num > 100000) throw new Error('Position size too large');
      return true;
    }),
    body('leverage').isInt({ min: 1, max: 125 })
      .withMessage('Leverage must be between 1x and 125x'),
    body('side').isIn(['long', 'short'])
      .withMessage('Side must be long or short'),
    body('stopLoss').optional().isNumeric()
      .withMessage('Stop loss must be numeric'),
    body('takeProfit').optional().isNumeric()
      .withMessage('Take profit must be numeric'),
  ],

  // Address validation
  address: [
    param('address').isEthereumAddress()
      .withMessage('Invalid Ethereum address'),
  ],

  // API Key validation
  apiKey: [
    body('apiKey').optional().isString().isLength({ min: 32, max: 64 })
      .withMessage('Invalid API key format'),
  ],
};

// 🔍 Enhanced Suspicious Activity Detection
const suspiciousPatterns = [
  // Script injection patterns
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  
  // SQL injection patterns
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|script)\b)/gi,
  /(--|\|{2}|\/\*|\*\/)/g,
  
  // Command injection patterns
  /(\||&|;|\n|\r)/g,
  /(wget|curl|nc|netcat|bash|sh|cmd|powershell)/gi,
  
  // Path traversal patterns
  /(\.\.\/|\.\.\\)/g,
  
  // XSS patterns
  /(<|%3c|&lt;)/gi,
];

export function detectSuspiciousActivity(req: Request): boolean {
  const requestString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  });

  return suspiciousPatterns.some(pattern => pattern.test(requestString));
}

// 🛡️ Security Logging Middleware
export function securityLogger(req: Request, res: Response, next: NextFunction) {
  // Check for suspicious patterns
  if (detectSuspiciousActivity(req)) {
    console.warn('🚨 Suspicious activity detected:', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString(),
      severity: 'HIGH'
    });
    
    // Log to security audit trail
    logSecurityEvent('SUSPICIOUS_ACTIVITY', req);
  }

  next();
}

// 📊 Security Audit Logging
interface SecurityEvent {
  type: string;
  ip: string;
  method: string;
  url: string;
  userAgent: string;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: any;
}

const securityAuditLog: SecurityEvent[] = [];

export function logSecurityEvent(type: string, req: Request, severity: SecurityEvent['severity'] = 'MEDIUM', details?: any) {
  const event: SecurityEvent = {
    type,
    ip: req.ip,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent') || 'Unknown',
    timestamp: new Date(),
    severity,
    details
  };

  securityAuditLog.push(event);
  
  // Keep only last 1000 events in memory
  if (securityAuditLog.length > 1000) {
    securityAuditLog.shift();
  }

  // Log critical events immediately
  if (severity === 'CRITICAL') {
    console.error('🔥 CRITICAL Security Event:', event);
  }
}

export function getSecurityAuditLog(limit: number = 100): SecurityEvent[] {
  return securityAuditLog.slice(-limit);
}

// 🛡️ Enhanced Validation Error Handler
export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log validation failures for security monitoring
    logSecurityEvent('VALIDATION_FAILED', req, 'LOW', {
      errors: errors.array(),
      body: req.body
    });

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array(), // Changed from 'details' to 'errors'
      timestamp: Date.now()
    });
  }
  next();
}

// 🛡️ Enhanced SQL Injection Prevention
export function preventSQLInjection(req: Request, res: Response, next: NextFunction) {
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|script)\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\||&|\n|\r)/g,
    /'(\s*(or|and)\s*\w+\s*=)|('.*')/gi
  ];
  
  const checkValue = (value: any, path: string = ''): boolean => {
    if (typeof value === 'string') {
      const isSuspicious = sqlPatterns.some(pattern => pattern.test(value));
      if (isSuspicious) {
        logSecurityEvent('SQL_INJECTION_ATTEMPT', req, 'HIGH', {
          suspiciousValue: value,
          path: path
        });
        return false;
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const [key, val] of Object.entries(value)) {
        if (!checkValue(val, `${path}.${key}`)) return false;
      }
    }
    return true;
  };

  // Check all request inputs
  const allInputs = { ...req.body, ...req.query, ...req.params };
  
  for (const [key, value] of Object.entries(allInputs)) {
    if (!checkValue(value, key)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input detected',
        code: 'SECURITY_VIOLATION',
        timestamp: Date.now()
      });
    }
  }
  
  next();
}

// 🛡️ Enhanced XSS Prevention
export function preventXSS(req: Request, res: Response, next: NextFunction) {
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi
  ];
  
  const sanitize = (value: any, path: string = ''): any => {
    if (typeof value === 'string') {
      const originalLength = value.length;
      let sanitized = value;
      
      // Remove XSS patterns
      xssPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });
      
      // Encode dangerous characters
      sanitized = sanitized
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
      
      // Log if significant changes were made
      if (sanitized.length < originalLength * 0.8) {
        logSecurityEvent('XSS_ATTEMPT_BLOCKED', req, 'HIGH', {
          originalValue: value,
          sanitizedValue: sanitized,
          path: path
        });
      }
      
      return sanitized;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const sanitizedObj: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitizedObj[key] = sanitize(val, `${path}.${key}`);
      }
      return sanitizedObj;
    } else if (Array.isArray(value)) {
      return value.map((item, index) => sanitize(item, `${path}[${index}]`));
    }
    return value;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitize(req.body, 'body');
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitize(req.query, 'query');
  }
  
  next();
}

// 🔐 Nonce Management for Replay Attack Prevention
interface NonceData {
  timestamp: number;
  used: boolean;
}

const nonceStore = new Map<string, NonceData>();

export function validateNonce(req: Request, res: Response, next: NextFunction) {
  const nonce = req.headers['x-nonce'] as string || req.body.nonce;
  
  if (!nonce) {
    return res.status(400).json({
      success: false,
      error: 'Nonce required for this operation',
      code: 'MISSING_NONCE'
    });
  }

  // Check if nonce exists and is not expired
  const nonceData = nonceStore.get(nonce);
  const now = Date.now();
  
  if (nonceData) {
    if (nonceData.used) {
      logSecurityEvent('REPLAY_ATTACK_ATTEMPT', req, 'CRITICAL', { nonce });
      return res.status(400).json({
        success: false,
        error: 'Nonce already used',
        code: 'REPLAY_ATTACK'
      });
    }
    
    if (now - nonceData.timestamp > securityConfig.NONCE_EXPIRY) {
      nonceStore.delete(nonce);
      return res.status(400).json({
        success: false,
        error: 'Nonce expired',
        code: 'NONCE_EXPIRED'
      });
    }
  } else {
    // New nonce, add to store
    nonceStore.set(nonce, { timestamp: now, used: false });
  }

  // Mark nonce as used
  nonceStore.set(nonce, { timestamp: now, used: true });

  // Clean up expired nonces
  cleanupExpiredNonces();
  
  next();
}

function cleanupExpiredNonces() {
  const now = Date.now();
  for (const [nonce, data] of nonceStore.entries()) {
    if (now - data.timestamp > securityConfig.NONCE_EXPIRY) {
      nonceStore.delete(nonce);
    }
  }
}

// 🛡️ API Key Validation
const validApiKeys = new Set(process.env.VALID_API_KEYS?.split(',') || []);

export function validateApiKey(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'production') {
    return next(); // Skip in development
  }

  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    logSecurityEvent('MISSING_API_KEY', req, 'MEDIUM');
    return res.status(401).json({
      success: false,
      error: 'API key required',
      code: 'MISSING_API_KEY'
    });
  }

  if (!validApiKeys.has(apiKey)) {
    logSecurityEvent('INVALID_API_KEY', req, 'HIGH', { apiKey: apiKey.substring(0, 8) + '...' });
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }

  next();
}

// 🛡️ Enhanced Error Handler
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Log all errors for security monitoring
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  };

  console.error('🔥 API Error:', errorDetails);
  
  // Log security-related errors with higher priority
  const securityKeywords = ['injection', 'xss', 'csrf', 'authentication', 'authorization', 'validation'];
  const isSecurityError = securityKeywords.some(keyword => 
    err.message.toLowerCase().includes(keyword)
  );

  if (isSecurityError) {
    logSecurityEvent('SECURITY_ERROR', req, 'HIGH', errorDetails);
  }

  // Send appropriate response based on environment
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: Date.now()
    });
  } else {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
      timestamp: Date.now()
    });
  }
}

// 🛡️ Security Status Endpoint Helper
export function getSecurityStatus(): {
  status: string;
  checks: Record<string, boolean>;
  stats: Record<string, number>;
  lastUpdate: string;
} {
  const recentEvents = getSecurityAuditLog(100);
  const criticalEvents = recentEvents.filter(e => e.severity === 'CRITICAL');
  const highEvents = recentEvents.filter(e => e.severity === 'HIGH');
  
  const status = criticalEvents.length > 0 ? 'CRITICAL' : 
                 highEvents.length > 5 ? 'WARNING' : 'SECURE';

  return {
    status,
    checks: {
      corsEnabled: true,
      rateLimitingActive: true,
      inputValidationActive: true,
      xssProtectionEnabled: true,
      sqlInjectionProtectionEnabled: true,
      nonceValidationEnabled: true,
      securityHeadersEnabled: true
    },
    stats: {
      totalEvents: recentEvents.length,
      criticalEvents: criticalEvents.length,
      highSeverityEvents: highEvents.length,
      activeNonces: nonceStore.size
    },
    lastUpdate: new Date().toISOString()
  };
}

// 🧹 Cleanup function for memory management
export function cleanupSecurityMemory() {
  cleanupExpiredNonces();
  
  // Keep only recent security audit logs
  if (securityAuditLog.length > 1000) {
    securityAuditLog.splice(0, securityAuditLog.length - 1000);
  }
}

// Start cleanup interval
setInterval(cleanupSecurityMemory, 5 * 60 * 1000); // Every 5 minutes

// 📤 Export all security utilities
export function sanitizeSQLInput(input: string): string {
  // Check for null/undefined
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove common SQL injection patterns
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments
    .replace(/\*\//g, '')
    .replace(/;/g, '') // Remove semicolons
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|script)\b/gi, ''); // Remove SQL keywords
}

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

// 🛡️ Security Middleware Application Helper
export function applySecurity(app: any) {
  // Apply security in the correct order
  app.use(cors(corsOptions));
  app.use(securityHeaders);
  app.use(securityLogger);
  app.use(preventSQLInjection);
  app.use(preventXSS);
  
  // Rate limiting for different route types
  app.use('/api/swap', rateLimiters.trading);
  app.use('/api/options', rateLimiters.derivatives);
  app.use('/api/futures', rateLimiters.derivatives);
  app.use('/api/flashloans', rateLimiters.highRisk);
  app.use('/api', rateLimiters.general);
  
  // Error handling
  app.use(errorHandler);
}
