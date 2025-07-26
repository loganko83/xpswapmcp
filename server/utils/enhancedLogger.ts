import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ElasticsearchTransport } from 'winston-elasticsearch';

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const ELASTIC_URL = process.env.ELASTIC_URL || 'http://localhost:9200';

// Log format with metadata
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata({
    fillWith: ['service', 'userId', 'requestId', 'ip', 'method', 'url']
  })
);

// Console transport for development
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

// File rotation transport
const fileRotateTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
});

// Error file rotation transport
const errorFileRotateTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat
});

// Security logs transport
const securityFileRotateTransport = new DailyRotateFile({
  filename: 'logs/security-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '90d',
  format: logFormat
});

// Configure transports based on environment
const transports: winston.transport[] = [];

if (NODE_ENV === 'development') {
  transports.push(consoleTransport);
  transports.push(fileRotateTransport);
  transports.push(errorFileRotateTransport);
} else {
  // Production transports
  transports.push(fileRotateTransport);
  transports.push(errorFileRotateTransport);
  transports.push(securityFileRotateTransport);
  
  // Add Elasticsearch transport for production
  if (ELASTIC_URL) {
    const esTransport = new ElasticsearchTransport({
      level: 'info',
      clientOpts: { 
        node: ELASTIC_URL,
        auth: {
          username: process.env.ELASTIC_USER || 'elastic',
          password: process.env.ELASTIC_PASSWORD || 'changeme'
        }
      },
      index: 'xpswap-logs',
      dataStream: true,
      retryLimit: 2,
      healthCheckTimeout: '30s'
    });
    
    transports.push(esTransport);
  }
}

// Create main logger
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports,
  defaultMeta: { service: 'xpswap-api' }
});

// Security logger with separate configuration
export const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [securityFileRotateTransport],
  defaultMeta: { service: 'xpswap-security' }
});

// Performance logger
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: 'logs/performance-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: logFormat
    })
  ],
  defaultMeta: { service: 'xpswap-performance' }
});

// Metrics collection
export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, any[]> = new Map();

  static getInstance() {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  recordMetric(name: string, value: any, metadata?: any) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push({
      value,
      timestamp: new Date(),
      metadata
    });
    
    // Log to performance logger
    performanceLogger.info('metric_recorded', {
      metric: name,
      value,
      metadata
    });
  }

  getMetrics(name: string, timeRange?: { start: Date, end: Date }) {
    const metrics = this.metrics.get(name) || [];
    
    if (timeRange) {
      return metrics.filter(m => 
        m.timestamp >= timeRange.start && 
        m.timestamp <= timeRange.end
      );
    }
    
    return metrics;
  }

  clearMetrics(name: string) {
    this.metrics.delete(name);
  }
}

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Attach request ID to request
  req.requestId = requestId;
  
  // Log request
  logger.info('request_received', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('request_completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration
    });
    
    // Record performance metric
    MetricsCollector.getInstance().recordMetric('api_request_duration', duration, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode
    });
  });
  
  next();
};

// Error logging middleware
export const errorLogger = (err: any, req: any, res: any, next: any) => {
  logger.error('request_error', {
    requestId: req.requestId,
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  next(err);
};

// Security event logger
export const logSecurityEvent = (event: string, details: any) => {
  securityLogger.warn(event, {
    timestamp: new Date(),
    event,
    details
  });
};

// Export utility functions
export const log = {
  info: (message: string, metadata?: any) => logger.info(message, metadata),
  warn: (message: string, metadata?: any) => logger.warn(message, metadata),
  error: (message: string, error?: Error, metadata?: any) => {
    logger.error(message, { error: error?.message, stack: error?.stack, ...metadata });
  },
  debug: (message: string, metadata?: any) => logger.debug(message, metadata),
  security: (event: string, details: any) => logSecurityEvent(event, details),
  performance: (metric: string, value: any, metadata?: any) => {
    MetricsCollector.getInstance().recordMetric(metric, value, metadata);
  }
};

export default logger;