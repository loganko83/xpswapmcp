// Enhanced Logger for XPSwap Security
import crypto from 'crypto';

// 📝 Enhanced Logger Class
class Logger {
  static log(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...metadata
    };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, 
      Object.keys(metadata).length > 0 ? JSON.stringify(metadata, null, 2) : '');
  }

  static info(message, metadata = {}) {
    this.log('info', message, metadata);
  }

  static warn(message, metadata = {}) {
    this.log('warn', message, metadata);
  }

  static error(message, metadata = {}) {
    this.log('error', message, metadata);
  }

  static debug(message, metadata = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, metadata);
    }
  }
}

// 🔒 Security Logger Class
class SecurityLogger {
  static logSecurityEvent(event, details = {}) {
    const securityEvent = {
      eventType: event,
      timestamp: new Date().toISOString(),
      eventId: crypto.randomBytes(16).toString('hex'),
      severity: details.severity || 'MEDIUM',
      ...details
    };

    console.error('🛡️ SECURITY EVENT:', JSON.stringify(securityEvent, null, 2));
    
    // In production, you would send this to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to security monitoring service (e.g., Splunk, DataDog, etc.)
    }
  }
}

// 📊 General security event logging function
export function logSecurityEvent(eventType, details = {}) {
  SecurityLogger.logSecurityEvent(eventType, details);
}

// Export default Logger and SecurityLogger
export default Logger;
export { SecurityLogger };
