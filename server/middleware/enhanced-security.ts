/**
 * Enhanced Security Middleware for XPSwap
 * Implements OWASP security best practices and API security guidelines
 */

import { Application, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import FrontendSecurityManager from '../services/frontend-security';

// Rate limiting configurations by environment
const getRateLimitConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isRateLimitEnabled = process.env.RATE_LIMIT_ENABLED === 'true';
  
  if (!isRateLimitEnabled) {
    return null;
  }

  return {
    windowMs: isProduction ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 min prod, 5 min dev
    max: isProduction ? 100 : 500, // Requests per window
    message: {
      error: 'Too many requests from this IP',
      retryAfter: isProduction ? 900 : 300 // seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for API health checks
    skip: (req) => req.path.includes('/health')
  };
};

// API-specific rate limiting (stricter)
const getApiRateLimitConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isRateLimitEnabled = process.env.RATE_LIMIT_ENABLED === 'true';
  
  if (!isRateLimitEnabled) {
    return null;
  }

  return {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 50 : 200, // API calls per window
    message: {
      error: 'API rate limit exceeded',
      retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false
  };
};

/**
 * Input validation middleware
 */
const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Check for common injection patterns
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /eval\s*\(/gi,
    /document\.write/gi,
    /innerHTML/gi
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  // Check query parameters, body, and headers
  const hasXSS = 
    checkValue(req.query) || 
    checkValue(req.body) || 
    checkValue(req.headers['user-agent']) ||
    checkValue(req.headers['referer']);

  if (hasXSS) {
    console.warn(`🚨 Suspicious input detected from ${req.ip}: ${req.method} ${req.path}`);
    return res.status(400).json({ 
      error: 'Invalid input detected',
      code: 'INVALID_INPUT'
    });
  }

  next();
};

/**
 * API key validation middleware
 */
const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Skip API key validation for public endpoints
  const publicEndpoints = ['/health', '/api/health', '/xp-price', '/crypto-ticker'];
  const basePath = process.env.BASE_PATH || '';
  const fullPath = req.path;
  
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    fullPath.includes(endpoint) || 
    fullPath.includes(`${basePath}${endpoint}`)
  );

  if (isPublicEndpoint) {
    return next();
  }

  // Check for API key in header or query
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const validKeys = process.env.VALID_API_KEYS?.split(',') || [];

  if (process.env.SECURITY_LEVEL === 'PRODUCTION' && validKeys.length > 0) {
    if (!apiKey || !validKeys.includes(apiKey as string)) {
      return res.status(401).json({
        error: 'Invalid or missing API key',
        code: 'UNAUTHORIZED'
      });
    }
  }

  next();
};

/**
 * Security logging middleware
 */
const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.SECURITY_LOGGING !== 'true') {
    return next();
  }

  // Log suspicious activities
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-originating-ip'
  ];

  const securityData = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    suspicious: false
  };

  // Check for proxy headers (potential IP spoofing)
  suspiciousHeaders.forEach(header => {
    if (req.headers[header]) {
      securityData.suspicious = true;
    }
  });

  // Log security events
  if (securityData.suspicious) {
    console.warn('🔍 Security Event:', JSON.stringify(securityData));
  }

  next();
};

/**
 * Apply all enhanced security middleware
 */
export function applyEnhancedSecurity(app: Application): void {
  console.log('🛡️ Applying Enhanced Security Middleware...');

  // 1. Security Headers (Helmet.js)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://www.ankr.com", "https://api.coingecko.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.HTTPS === 'true' ? [] : null
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // 2. CORS Configuration
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://trendy.storydot.kr', 'https://xpswap.io']
      : ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:5195'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
  };
  
  app.use(cors(corsOptions));

  // 3. Rate Limiting
  const rateLimitConfig = getRateLimitConfig();
  if (rateLimitConfig) {
    app.use(rateLimit(rateLimitConfig));
    
    // API-specific stricter rate limiting
    const apiRateLimitConfig = getApiRateLimitConfig();
    if (apiRateLimitConfig) {
      app.use('/api', rateLimit(apiRateLimitConfig));
      if (process.env.BASE_PATH) {
        app.use(`${process.env.BASE_PATH}/api`, rateLimit(apiRateLimitConfig));
      }
    }
  }

  // 4. Input Validation
  app.use(validateInput);

  // 5. Security Logging
  app.use(securityLogger);

  // 6. Frontend Security Enhancement (CSP and Security Headers)
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendSecurity = new FrontendSecurityManager(isProduction);
  
  // Validate frontend security configuration
  const securityValidation = frontendSecurity.validateConfiguration();
  if (!securityValidation.valid) {
    console.warn('⚠️ Frontend Security Configuration Issues:', securityValidation.issues);
  }
  
  app.use(frontendSecurity.getExpressMiddleware());
  
  // CSP Violation Reporting endpoint
  app.post('/api/security/csp-report', frontendSecurity.getCSPReportHandler());
  
  console.log('✅ Frontend Security Manager Applied');
  console.log(`   - CSP Enabled: ${frontendSecurity.getSecurityStatus().csp.enabled}`);
  console.log(`   - Report Only: ${frontendSecurity.getSecurityStatus().csp.reportOnly}`);

  // 7. Input Validation
  app.use(validateInput);

  // 8. Security Logging
  app.use(securityLogger);

  // 9. API Key Validation (for protected endpoints)
  app.use(validateApiKey);

  // 10. Request size limits (already applied in main server)
  // app.use(express.json({ limit: '10mb' }));

  console.log('✅ Enhanced Security Middleware Applied');
  console.log(`   - Rate Limiting: ${rateLimitConfig ? 'Enabled' : 'Disabled'}`);
  console.log(`   - Security Level: ${process.env.SECURITY_LEVEL || 'DEVELOPMENT'}`);
  console.log(`   - CORS Origins: ${corsOptions.origin}`);
}
