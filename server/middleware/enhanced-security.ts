import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';
import Logger, { SecurityLogger, logSecurityEvent } from '../utils/logger-enhanced.js';

// 🔒 Enhanced Security Configuration
export const enhancedSecurityConfig = {
  MAX_DAILY_VOLUME: 1000000, // $1M daily volume limit
  MIN_TRADE_INTERVAL: 1000, // 1 second minimum between trades
  PRICE_VALIDITY_PERIOD: 5 * 60 * 1000, // 5 minutes
  MAX_PRICE_DEVIATION: 500, // 5% maximum price deviation
  FLASH_LOAN_COOLDOWN: 10 * 60 * 1000, // 10 minutes cooldown
  MAX_FLASH_LOAN_AMOUNT: 10000000, // $10M maximum flash loan
  NONCE_EXPIRY: 15 * 60 * 1000, // 15 minutes nonce validity
  RATE_LIMIT_SKIP_ON_SUCCESS: false,
  BRUTE_FORCE_PROTECTION: true,
  DDOS_PROTECTION_LEVEL: 'HIGH',
};

// 🛡️ Advanced Rate Limiting with IP-based tracking
interface RateLimitStore {
  [ip: string]: {
    requests: number;
    firstRequestTime: number;
    blockedUntil?: number;
    suspiciousActivity: boolean;
  }
}

const rateLimitStore: RateLimitStore = {};
const suspiciousIPs = new Set<string>();

// Clean up rate limit store every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of Object.entries(rateLimitStore)) {
    if (now - data.firstRequestTime > 15 * 60 * 1000) { // 15 minutes
      delete rateLimitStore[ip];
    }
  }
}, 10 * 60 * 1000);

export const enhancedRateLimiters = {
  // Ultra-strict general API rate limit
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Reduced from 100 to 50
    standardHeaders: true,
    legacyHeaders: false,
    // Remove custom keyGenerator to use default IP handling with IPv6 support
    handler: (req, res) => {
      const clientKey = `${req.ip}-${req.get('User-Agent')}`;
      console.error('🚨 RATE LIMIT EXCEEDED:', {
        ip: req.ip,
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        headers: req.headers,
        severity: 'HIGH'
      });

      // Mark IP as suspicious after repeated rate limit violations
      suspiciousIPs.add(req.ip);
      
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 900, // 15 minutes in seconds
        timestamp: Date.now()
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    }
  }),

  // Extremely strict trading operations
  trading: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Reduced from 10 to 5
    message: {
      success: false,
      error: 'Too many trading requests - maximum 5 per minute',
      code: 'TRADING_RATE_LIMIT_EXCEEDED',
      retryAfter: 60,
      timestamp: Date.now()
    },
    handler: (req, res, next) => {
      console.error('🔥 TRADING RATE LIMIT EXCEEDED:', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL'
      });

      // Temporary block for repeated violations
      const now = Date.now();
      if (!rateLimitStore[req.ip]) {
        rateLimitStore[req.ip] = {
          requests: 1,
          firstRequestTime: now,
          suspiciousActivity: false
        };
      } else {
        rateLimitStore[req.ip].requests++;
        if (rateLimitStore[req.ip].requests > 10) {
          rateLimitStore[req.ip].blockedUntil = now + 30 * 60 * 1000; // Block for 30 minutes
          rateLimitStore[req.ip].suspiciousActivity = true;
        }
      }

      res.status(429).json({
        success: false,
        error: 'Trading rate limit exceeded',
        code: 'TRADING_BLOCKED',
        retryAfter: 60,
        timestamp: Date.now()
      });
    }
  }),

  // Ultra-strict high-risk operations
  highRisk: rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 2, // Only 2 high-risk operations per 30 minutes
    handler: (req, res) => {
      console.error('🔴 HIGH-RISK RATE LIMIT EXCEEDED:', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL'
      });

      res.status(429).json({
        success: false,
        error: 'High-risk operation limit exceeded',
        code: 'HIGH_RISK_BLOCKED',
        retryAfter: 1800, // 30 minutes
        timestamp: Date.now()
      });
    }
  }),

  // Derivatives trading with progressive penalties
  derivatives: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Reduced from 20 to 10
    handler: (req, res) => {
      console.warn('⚠️ DERIVATIVES RATE LIMIT:', {
        ip: req.ip,
        path: req.path,
        timestamp: new Date().toISOString()
      });

      res.status(429).json({
        success: false,
        error: 'Derivatives trading limit exceeded',
        code: 'DERIVATIVES_BLOCKED',
        retryAfter: 300,
        timestamp: Date.now()
      });
    }
  }),

  // Authentication attempts (login, registration)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 auth attempts per 15 minutes
    skipSuccessfulRequests: true,
    handler: (req, res) => {
      console.error('🚨 AUTH RATE LIMIT EXCEEDED:', {
        ip: req.ip,
        path: req.path,
        timestamp: new Date().toISOString(),
        severity: 'HIGH'
      });

      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts',
        code: 'AUTH_RATE_LIMIT',
        retryAfter: 900,
        timestamp: Date.now()
      });
    }
  })
};

// 🔐 Advanced Cryptographic Security Functions
export class CryptoSecurityManager {
  private static instance: CryptoSecurityManager;
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivationRounds = 100000; // PBKDF2 iterations

  static getInstance(): CryptoSecurityManager {
    if (!CryptoSecurityManager.instance) {
      CryptoSecurityManager.instance = new CryptoSecurityManager();
    }
    return CryptoSecurityManager.instance;
  }

  // Generate cryptographically secure random bytes
  generateSecureRandom(length: number = 32): Buffer {
    return crypto.randomBytes(length);
  }

  // Generate secure nonce with timestamp and entropy
  generateSecureNonce(): string {
    const timestamp = Date.now().toString(16);
    const randomBytes = crypto.randomBytes(24).toString('hex');
    const entropy = process.hrtime.bigint().toString(16);
    return `${timestamp}${randomBytes}${entropy}`;
  }

  // Generate secure transaction hash with multiple entropy sources
  generateSecureTransactionHash(): string {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(32);
    const entropy = process.hrtime.bigint().toString();
    const machineId = crypto.createHash('sha256').update(process.env.MACHINE_ID || 'default').digest();
    
    const combined = Buffer.concat([
      Buffer.from(timestamp),
      randomBytes,
      Buffer.from(entropy),
      machineId
    ]);

    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  // Generate secure API key
  generateSecureApiKey(): string {
    const prefix = 'xps_';
    const randomPart = crypto.randomBytes(32).toString('hex');
    const checksum = crypto.createHash('sha256').update(randomPart).digest('hex').substring(0, 8);
    return `${prefix}${randomPart}${checksum}`;
  }

  // Secure password hashing with salt
  async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const salt = crypto.randomBytes(32);
    const hash = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(password, salt, this.keyDerivationRounds, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
    
    return {
      hash: hash.toString('hex'),
      salt: salt.toString('hex')
    };
  }

  // Verify password
  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const saltBuffer = Buffer.from(salt, 'hex');
    const hashBuffer = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(password, saltBuffer, this.keyDerivationRounds, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
    
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), hashBuffer);
  }

  // Encrypt sensitive data
  encrypt(text: string, password: string): { encrypted: string; iv: string; tag: string; salt: string } {
    const salt = crypto.randomBytes(32);
    const key = crypto.pbkdf2Sync(password, salt, this.keyDerivationRounds, 32, 'sha512');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('XPSwap-DEX', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex')
    };
  }

  // Generate secure session ID
  generateSecureSessionId(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(24);
    const entropy = process.hrtime.bigint();
    
    const combined = Buffer.concat([
      Buffer.from(timestamp.toString()),
      random,
      Buffer.from(entropy.toString())
    ]);
    
    return crypto.createHash('sha256').update(combined).digest('hex');
  }
}

// 🔒 HTTPS Enforcement Middleware
export function enforceHTTPS(req: Request, res: Response, next: NextFunction) {
  // Skip in development or when HTTPS is disabled
  if (process.env.NODE_ENV !== 'production' || process.env.HTTPS !== 'true') {
    return next();
  }

  // Check if request is already HTTPS
  if (req.secure || req.get('X-Forwarded-Proto') === 'https') {
    return next();
  }

  // Force redirect to HTTPS
  const httpsUrl = `https://${req.get('host')}${req.url}`;
  
  console.log('🔒 Redirecting HTTP to HTTPS:', {
    originalUrl: req.url,
    httpsUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  return res.redirect(301, httpsUrl);
}

// 🛡️ Enhanced CORS with stricter settings
export const enhancedCorsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? ['https://trendy.storydot.kr', 'https://xpswap.com', 'https://app.xpswap.com', 'http://localhost:5001', 'http://localhost:5000', 'http://localhost:5002']
      : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000', 'https://localhost:5000', 'http://localhost:5173'];
    
    // Allow requests with no origin for local testing
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin!)) {
      callback(null, true);
    } else {
      console.error('🚨 CORS VIOLATION:', { 
        origin, 
        timestamp: new Date().toISOString(),
        allowedOrigins 
      });
      callback(new Error('Blocked by CORS policy'));
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
    'X-Signature',
    'X-Timestamp'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 300, // Reduced from 86400 to 300 seconds (5 minutes)
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// 🛡️ Ultra-Enhanced Security Headers
export const ultraSecurityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Required for styled-components
        "https://fonts.googleapis.com"
      ],
      scriptSrc: process.env.NODE_ENV === 'development' 
        ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"]
        : ["'self'", "https://cdn.jsdelivr.net"], // Only specific CDNs in production
      imgSrc: [
        "'self'", 
        "https:",
        "data:",
        "https://coin-images.coingecko.com",
        "https://assets.coingecko.com",
        "https://s2.coinmarketcap.com"
      ],
      connectSrc: [
        "'self'", 
        "https:",
        "wss:",
        ...(process.env.NODE_ENV === 'development' 
          ? ["ws://localhost:*", "http://localhost:*"] 
          : []),
        "https://api.coingecko.com",
        "https://pro-api.coinmarketcap.com",
        "https://api.1inch.io",
        "https://li.quest"
      ],
      fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      childSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: { policy: "require-corp" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  permittedCrossDomainPolicies: false,
  hidePoweredBy: true,
});

// 🔍 IP Reputation and Blocking System
interface IPReputation {
  score: number; // 0-100 (0 = bad, 100 = good)
  lastSeen: number;
  violations: string[];
  blocked: boolean;
  blockedUntil?: number;
}

const ipReputationDB = new Map<string, IPReputation>();

export function checkIPReputation(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip;
  const now = Date.now();
  
  // Check if IP is in our reputation database
  let reputation = ipReputationDB.get(clientIP);
  
  if (!reputation) {
    // New IP - start with neutral reputation
    reputation = {
      score: 80, // Start with good reputation
      lastSeen: now,
      violations: [],
      blocked: false
    };
    ipReputationDB.set(clientIP, reputation);
  }

  // Check if IP is currently blocked
  if (reputation.blocked && reputation.blockedUntil && now < reputation.blockedUntil) {
    console.error('🚫 BLOCKED IP ATTEMPTED ACCESS:', {
      ip: clientIP,
      blockedUntil: new Date(reputation.blockedUntil).toISOString(),
      violations: reputation.violations,
      score: reputation.score
    });

    return res.status(403).json({
      success: false,
      error: 'IP address is temporarily blocked',
      code: 'IP_BLOCKED',
      timestamp: Date.now()
    });
  }

  // Update last seen
  reputation.lastSeen = now;
  
  // If reputation is very low, add extra scrutiny
  if (reputation.score < 20) {
    console.warn('🔍 LOW REPUTATION IP:', {
      ip: clientIP,
      score: reputation.score,
      violations: reputation.violations
    });
    
    // Add extra validation for low-reputation IPs
    req.lowReputationIP = true;
  }

  next();
}

export function updateIPReputation(ip: string, violation: string, scoreChange: number = -10) {
  let reputation = ipReputationDB.get(ip);
  
  if (!reputation) {
    reputation = {
      score: 80,
      lastSeen: Date.now(),
      violations: [],
      blocked: false
    };
  }

  // Update score
  reputation.score = Math.max(0, Math.min(100, reputation.score + scoreChange));
  reputation.violations.push(`${violation} at ${new Date().toISOString()}`);
  
  // Block IP if score is very low
  if (reputation.score < 10) {
    reputation.blocked = true;
    reputation.blockedUntil = Date.now() + 24 * 60 * 60 * 1000; // Block for 24 hours
    
    console.error('🚫 IP BLOCKED DUE TO LOW REPUTATION:', {
      ip,
      score: reputation.score,
      violations: reputation.violations
    });
  }

  ipReputationDB.set(ip, reputation);
}

// 🛡️ Advanced Error Handling with Information Leak Prevention
export function enhancedErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Generate unique error ID for logging correlation
  const errorId = CryptoSecurityManager.getInstance().generateSecureNonce().substring(0, 16);
  
  // Detailed logging for internal use
  const errorDetails = {
    id: errorId,
    message: err.message,
    stack: err.stack,
    name: err.name,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    body: process.env.NODE_ENV === 'development' ? req.body : '[REDACTED]',
    query: req.query,
    params: req.params,
  };

  // Log error based on severity
  if (err.name === 'ValidationError' || err.message.includes('validation')) {
    console.warn('⚠️ VALIDATION ERROR:', errorDetails);
  } else if (err.name === 'UnauthorizedError' || err.message.includes('unauthorized')) {
    console.error('🔐 AUTHENTICATION ERROR:', errorDetails);
    updateIPReputation(req.ip, 'AUTH_ERROR', -5);
  } else if (err.message.includes('rate limit') || err.message.includes('too many')) {
    console.error('🚨 RATE LIMIT ERROR:', errorDetails);
    updateIPReputation(req.ip, 'RATE_LIMIT_VIOLATION', -15);
  } else {
    console.error('💥 GENERAL ERROR:', errorDetails);
  }

  // Security keywords that indicate potential attacks
  const securityKeywords = [
    'injection', 'xss', 'csrf', 'authentication', 'authorization', 
    'validation', 'sql', 'script', 'payload', 'exploit', 'attack'
  ];
  
  const isSecurityError = securityKeywords.some(keyword => 
    err.message.toLowerCase().includes(keyword) || err.stack?.toLowerCase().includes(keyword)
  );

  if (isSecurityError) {
    console.error('🔥 SECURITY ERROR DETECTED:', errorDetails);
    updateIPReputation(req.ip, 'SECURITY_ERROR', -20);
  }

  // Determine status code
  let statusCode = 500;
  if (err.name === 'ValidationError') statusCode = 400;
  if (err.name === 'UnauthorizedError') statusCode = 401;
  if (err.name === 'ForbiddenError') statusCode = 403;
  if (err.name === 'NotFoundError') statusCode = 404;
  if (err.message.includes('rate limit')) statusCode = 429;

  // Generic error response for production (no information leakage)
  if (process.env.NODE_ENV === 'production') {
    const genericErrors: { [key: number]: string } = {
      400: 'Invalid request parameters',
      401: 'Authentication required',
      403: 'Access denied',
      404: 'Resource not found',
      429: 'Rate limit exceeded',
      500: 'Internal server error'
    };

    res.status(statusCode).json({
      success: false,
      error: genericErrors[statusCode] || 'An error occurred',
      code: `ERROR_${statusCode}`,
      errorId, // Only include error ID for support purposes
      timestamp: Date.now()
    });
  } else {
    // Development: more detailed errors
    res.status(statusCode).json({
      success: false,
      error: err.message,
      code: err.name || `ERROR_${statusCode}`,
      errorId,
      stack: err.stack,
      details: errorDetails,
      timestamp: Date.now()
    });
  }
}

// 🧹 Enhanced Memory Management and Cleanup
export function enhancedCleanupSecurityMemory() {
  const now = Date.now();
  
  // Clean up rate limit store
  for (const [ip, data] of Object.entries(rateLimitStore)) {
    if (now - data.firstRequestTime > 30 * 60 * 1000) { // 30 minutes
      delete rateLimitStore[ip];
    }
  }

  // Clean up IP reputation database
  for (const [ip, reputation] of ipReputationDB.entries()) {
    // Remove entries older than 7 days if they have good reputation
    if (now - reputation.lastSeen > 7 * 24 * 60 * 60 * 1000 && reputation.score > 70) {
      ipReputationDB.delete(ip);
    }
    
    // Unblock IPs whose block period has expired
    if (reputation.blocked && reputation.blockedUntil && now > reputation.blockedUntil) {
      reputation.blocked = false;
      reputation.blockedUntil = undefined;
      reputation.score = 50; // Reset to neutral
      console.log('✅ IP unblocked after timeout:', ip);
    }
  }

  // Clean up suspicious IPs set
  if (suspiciousIPs.size > 1000) {
    suspiciousIPs.clear();
    console.log('🧹 Cleared suspicious IPs cache');
  }
}

// Start enhanced cleanup interval
setInterval(enhancedCleanupSecurityMemory, 5 * 60 * 1000); // Every 5 minutes

// 📊 Enhanced Security Status
export function getEnhancedSecurityStatus(): {
  status: 'SECURE' | 'WARNING' | 'CRITICAL';
  checks: Record<string, boolean>;
  stats: Record<string, number>;
  threats: string[];
  lastUpdate: string;
} {
  const now = Date.now();
  const blockedIPs = Array.from(ipReputationDB.values()).filter(rep => rep.blocked).length;
  const lowReputationIPs = Array.from(ipReputationDB.values()).filter(rep => rep.score < 30).length;
  const recentViolations = Array.from(ipReputationDB.values())
    .filter(rep => rep.lastSeen > now - 60 * 60 * 1000) // Last hour
    .reduce((sum, rep) => sum + rep.violations.length, 0);

  const threats: string[] = [];
  let status: 'SECURE' | 'WARNING' | 'CRITICAL' = 'SECURE';

  if (blockedIPs > 0) {
    threats.push(`${blockedIPs} IPs currently blocked`);
    status = 'WARNING';
  }

  if (lowReputationIPs > 5) {
    threats.push(`${lowReputationIPs} IPs with low reputation`);
    if (status === 'SECURE') status = 'WARNING';
  }

  if (recentViolations > 10) {
    threats.push(`${recentViolations} security violations in last hour`);
    status = 'CRITICAL';
  }

  if (suspiciousIPs.size > 50) {
    threats.push(`${suspiciousIPs.size} IPs flagged as suspicious`);
    if (status === 'SECURE') status = 'WARNING';
  }

  return {
    status,
    checks: {
      httpsEnforced: process.env.NODE_ENV === 'production',
      corsEnabled: true,
      rateLimitingActive: true,
      inputValidationActive: true,
      xssProtectionEnabled: true,
      sqlInjectionProtectionEnabled: true,
      ipReputationActive: true,
      cryptoSecurityEnabled: true,
      errorLeakPrevention: true,
      securityHeadersEnabled: true
    },
    stats: {
      totalTrackedIPs: ipReputationDB.size,
      blockedIPs,
      lowReputationIPs,
      suspiciousIPs: suspiciousIPs.size,
      recentViolations,
      activeRateLimits: Object.keys(rateLimitStore).length
    },
    threats,
    lastUpdate: new Date().toISOString()
  };
}

// 🛡️ Apply Enhanced Security Middleware
export function applyEnhancedSecurity(app: any) {
  // Apply in correct order for maximum security
  console.log('🔒 Applying enhanced security middleware...');
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const rateLimitEnabled = process.env.RATE_LIMIT_ENABLED === 'true';
  
  // 1. HTTPS enforcement (first) - skip in development
  if (!isDevelopment) {
    app.use(enforceHTTPS);
  }
  
  // 2. IP reputation checking - skip in development
  if (!isDevelopment && process.env.IP_REPUTATION_ENABLED === 'true') {
    app.use(checkIPReputation);
  }
  
  // 3. Enhanced CORS
  app.use(cors(enhancedCorsOptions));
  
  // 4. Ultra security headers
  app.use(ultraSecurityHeaders);
  
  // 5. Rate limiting for different endpoints - skip in development or if disabled
  if (!isDevelopment && rateLimitEnabled) {
    app.use('/api/auth', enhancedRateLimiters.auth);
    app.use('/api/swap', enhancedRateLimiters.trading);
    app.use('/api/options', enhancedRateLimiters.derivatives);
    app.use('/api/futures', enhancedRateLimiters.derivatives);
    app.use('/api/flashloans', enhancedRateLimiters.highRisk);
    app.use('/api', enhancedRateLimiters.general);
  } else {
    console.log('⚠️ Rate limiting disabled for development environment');
  }
  
  // 6. Enhanced error handling (last)
  app.use(enhancedErrorHandler);
  
  console.log('✅ Enhanced security middleware applied successfully');
}

// Export the crypto security manager instance
export const cryptoManager = CryptoSecurityManager.getInstance();

// 🔐 Declare additional request properties
declare global {
  namespace Express {
    interface Request {
      lowReputationIP?: boolean;
    }
  }
}
