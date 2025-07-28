import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import ElasticsearchTransport from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';

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
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// 구조화된 JSON 포맷 (중앙화된 로깅 시스템용)
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 파일 트랜스포트 설정
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/xpswap-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '30d',
  format: jsonFormat,
});

// 에러 로그 전용 트랜스포트
const errorFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '30d',
  level: 'error',
  format: jsonFormat,
});

// 보안 이벤트 전용 트랜스포트
const securityFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/security-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '30d',
  format: jsonFormat,
});

// Elasticsearch 클라이언트 설정 (프로덕션 환경)
let elasticsearchClient: Client | null = null;
let elasticsearchTransport: any = null;

if (process.env.NODE_ENV === 'production' && process.env.ELASTICSEARCH_NODE) {
  elasticsearchClient = new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTICSEARCH_USER || 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD || ''
    },
    tls: {
      rejectUnauthorized: false // 프로덕션에서는 true로 설정 권장
    }
  });

  // Elasticsearch 트랜스포트 설정
  elasticsearchTransport = new ElasticsearchTransport({
    level: 'info',
    client: elasticsearchClient,
    index: 'xpswap-logs',
    transformer: (logData: any) => {
      return {
        '@timestamp': new Date().toISOString(),
        message: logData.message,
        severity: logData.level,
        application: 'xpswap-dex',
        environment: process.env.NODE_ENV,
        ...logData.meta
      };
    }
  });
}

// 트랜스포트 배열
const transports: winston.transport[] = [
  new winston.transports.Console({
    format,
  }),
  fileRotateTransport,
  errorFileTransport,
];

// Elasticsearch 트랜스포트 추가 (프로덕션)
if (elasticsearchTransport) {
  transports.push(elasticsearchTransport);
}

// 프로덕션 환경에서는 콘솔 로그 제한
if (process.env.NODE_ENV === 'production') {
  transports[0] = new winston.transports.Console({
    format,
    level: 'warn', // 프로덕션에서는 warn 이상만 콘솔에 출력
  });
}

// Logger 생성
const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  transports,
});

// 보안 로거 생성 (중앙화된 로깅 시스템 통합)
export const SecurityLogger = winston.createLogger({
  level: 'info',
  format: jsonFormat,
  transports: [
    securityFileTransport,
    // 보안 이벤트는 별도의 Elasticsearch 인덱스로
    elasticsearchTransport ? new ElasticsearchTransport({
      level: 'info',
      client: elasticsearchClient!,
      index: 'xpswap-security',
      transformer: (logData: any) => {
        return {
          '@timestamp': new Date().toISOString(),
          message: logData.message,
          severity: logData.level,
          application: 'xpswap-dex',
          environment: process.env.NODE_ENV,
          type: 'security',
          ...logData.meta
        };
      }
    }) : null
  ].filter(Boolean) as winston.transport[]
});

// HTTP 요청 로깅 미들웨어
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      Logger.warn('HTTP Request Error', logData);
    } else {
      Logger.http('HTTP Request', logData);
    }
  });

  next();
};

// 보안 이벤트 로깅 함수 (중앙화된 시스템에 전송)
export const logSecurityEvent = (event: string, details: any) => {
  const securityEvent = {
    event,
    details,
    timestamp: new Date().toISOString(),
    serverInstance: process.env.INSTANCE_ID || 'default',
    environment: process.env.NODE_ENV,
  };

  SecurityLogger.info(securityEvent);

  // 중요 보안 이벤트는 즉시 알림
  if (isCriticalSecurityEvent(event)) {
    sendSecurityAlert(securityEvent);
  }
};

// 중요 보안 이벤트 판별
function isCriticalSecurityEvent(event: string): boolean {
  const criticalEvents = [
    'SECURITY_BREACH',
    'MULTIPLE_AUTH_FAILURES',
    'SQL_INJECTION_ATTEMPT',
    'XSS_ATTEMPT',
    'SUSPICIOUS_ACTIVITY',
    'IP_BLOCKED',
    'RATE_LIMIT_EXCEEDED_CRITICAL',
    'UNAUTHORIZED_ACCESS_ATTEMPT'
  ];
  
  return criticalEvents.includes(event);
}

// 보안 알림 전송 (Slack, Email 등)
async function sendSecurityAlert(event: any) {
  // Slack Webhook 알림
  if (process.env.SLACK_SECURITY_WEBHOOK) {
    try {
      await fetch(process.env.SLACK_SECURITY_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Security Alert: ${event.event}`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Event', value: event.event, short: true },
              { title: 'Environment', value: event.environment, short: true },
              { title: 'Timestamp', value: event.timestamp, short: false },
              { title: 'Details', value: JSON.stringify(event.details, null, 2), short: false }
            ]
          }]
        })
      });
    } catch (error) {
      Logger.error('Failed to send Slack security alert', error);
    }
  }
}

// API 사용량 추적 (메트릭 수집)
export const logAPIUsage = (endpoint: string, userId: string, responseTime: number) => {
  const apiMetric = {
    type: 'API_USAGE',
    endpoint,
    userId,
    responseTime,
    timestamp: new Date().toISOString(),
    serverInstance: process.env.INSTANCE_ID || 'default',
  };

  Logger.info(apiMetric);

  // Prometheus 메트릭 업데이트 (별도 구현 필요)
  updatePrometheusMetrics(apiMetric);
};

// Prometheus 메트릭 업데이트 스텁
function updatePrometheusMetrics(metric: any) {
  // TODO: Prometheus 클라이언트 라이브러리 통합
  // apiRequestDuration.observe({ endpoint: metric.endpoint }, metric.responseTime);
  // apiRequestTotal.inc({ endpoint: metric.endpoint });
}

// 에러 로깅 함수 (스택 트레이스 포함)
export const logError = (error: Error, context?: any) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    serverInstance: process.env.INSTANCE_ID || 'default',
    environment: process.env.NODE_ENV,
  };

  Logger.error(errorLog);

  // Sentry에 에러 전송 (별도 구현 필요)
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context });
  }
};

// 성능 메트릭 로깅
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  const perfLog = {
    type: 'PERFORMANCE',
    operation,
    duration,
    metadata,
    timestamp: new Date().toISOString(),
    serverInstance: process.env.INSTANCE_ID || 'default',
  };

  Logger.info(perfLog);

  // 성능이 임계값을 초과하면 경고
  if (duration > 1000) { // 1초 이상
    Logger.warn(`Slow operation detected: ${operation} took ${duration}ms`, perfLog);
  }
};

// 로그 집계 및 분석
export const getLogAnalytics = async (timeRange: string = '1h') => {
  if (!elasticsearchClient) {
    return { error: 'Elasticsearch not configured' };
  }

  try {
    const response = await elasticsearchClient.search({
      index: 'xpswap-logs',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: `now-${timeRange}`
            }
          }
        },
        aggs: {
          status_codes: {
            terms: { field: 'status' }
          },
          response_times: {
            stats: { field: 'duration' }
          },
          top_endpoints: {
            terms: { field: 'url.keyword', size: 10 }
          },
          error_rate: {
            filter: {
              range: { status: { gte: 400 } }
            }
          }
        }
      }
    });

    return response.body.aggregations;
  } catch (error) {
    Logger.error('Failed to get log analytics', error);
    return { error: 'Failed to retrieve analytics' };
  }
};

// 로그 정리 스케줄러
export const scheduleLogCleanup = () => {
  // 매일 자정에 오래된 로그 정리
  setInterval(async () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30일 이상 된 로그

    if (elasticsearchClient) {
      try {
        await elasticsearchClient.deleteByQuery({
          index: 'xpswap-logs',
          body: {
            query: {
              range: {
                '@timestamp': {
                  lt: cutoffDate.toISOString()
                }
              }
            }
          }
        });
        
        Logger.info('Old logs cleaned up successfully');
      } catch (error) {
        Logger.error('Failed to clean up old logs', error);
      }
    }
  }, 24 * 60 * 60 * 1000); // 24시간마다
};

// 로거 초기화 시 정리 스케줄러 시작
if (process.env.NODE_ENV === 'production') {
  scheduleLogCleanup();
}

export default Logger;
