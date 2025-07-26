import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 로그 레벨 정의
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 로그 색상 정의
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// 로그 포맷 정의
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// 파일 트랜스포트 설정
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/xpswap-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '30d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

// 에러 로그 전용 트랜스포트
const errorFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '30d',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

// 보안 이벤트 전용 트랜스포트const securityFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/security-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '30d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

// 트랜스포트 배열
const transports = [
  new winston.transports.Console({
    format,
  }),
  fileRotateTransport,
  errorFileTransport,
];

// 프로덕션 환경에서는 콘솔 로그 제한
if (process.env.NODE_ENV === 'production') {
  transports[0] = new winston.transports.Console({
    format,
    level: 'warn', // 프로덕션에서는 warn 이상만 콘솔에 출력
  });
}

// Logger 생성
const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',  levels,
  transports,
});

// 보안 로거 생성
export const SecurityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [securityFileTransport],
});

// HTTP 요청 로깅 미들웨어
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.url} ${res.statusCode} ${duration}ms - ${req.ip}`;
    
    if (res.statusCode >= 400) {
      Logger.warn(message);
    } else {
      Logger.http(message);
    }
  });

  next();
};

// 보안 이벤트 로깅 함수export const logSecurityEvent = (event: string, details: any) => {
  SecurityLogger.info({
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

// API 사용량 추적
export const logAPIUsage = (endpoint: string, userId: string, responseTime: number) => {
  Logger.info({
    type: 'API_USAGE',
    endpoint,
    userId,
    responseTime,
    timestamp: new Date().toISOString(),
  });
};

// 에러 로깅 함수
export const logError = (error: Error, context?: any) => {
  Logger.error({
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// 성능 메트릭 로깅
export const logPerformance = (operation: string, duration: number, metadata?: any) => {  Logger.info({
    type: 'PERFORMANCE',
    operation,
    duration,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

export default Logger;