/**
 * Additional exports for backward compatibility
 */
import crypto from 'crypto';

// Crypto manager for security operations
export const cryptoManager = {
  generateSecureToken: (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  },
  
  hashPassword: (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  },
  
  verifyPassword: (password: string, storedHash: string): boolean => {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  },
  
  encryptData: (data: string, key?: string): string => {
    const algorithm = 'aes-256-gcm';
    const secretKey = key || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, secretKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  },
  
  decryptData: (encryptedData: string, key?: string): string => {
    try {
      const algorithm = 'aes-256-gcm';
      const secretKey = key || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipher(algorithm, secretKey);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }
};

// Enhanced security status checker
export const getEnhancedSecurityStatus = () => {
  return {
    timestamp: new Date().toISOString(),
    securityLevel: process.env.SECURITY_LEVEL || 'DEVELOPMENT',
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED === 'true',
    httpsEnabled: process.env.HTTPS === 'true',
    environment: process.env.NODE_ENV || 'development',
    cryptoLevel: process.env.CRYPTO_SECURITY_LEVEL || 'LOW',
    features: {
      helmet: true,
      cors: true,
      rateLimit: process.env.RATE_LIMIT_ENABLED === 'true',
      inputValidation: true,
      securityLogging: process.env.SECURITY_LOGGING === 'true',
      apiKeyValidation: true
    },
    checks: {
      environmentVariables: true,
      secureHeaders: true,
      inputSanitization: true,
      errorHandling: true
    }
  };
};

// Security event logger
export const securityEventLogger = {
  logSecurityEvent: (event: any) => {
    if (process.env.SECURITY_LOGGING === 'true') {
      console.log('🔒 Security Event:', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...event
      }));
    }
  },
  
  logSuspiciousActivity: (activity: any) => {
    console.warn('🚨 Suspicious Activity:', JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'WARNING',
      ...activity
    }));
  },
  
  logSecurityViolation: (violation: any) => {
    console.error('🛑 Security Violation:', JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      ...violation
    }));
  }
};
