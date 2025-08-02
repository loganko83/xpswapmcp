/**
 * 📊 보안 로깅 및 모니터링 시스템
 * XPSwap DEX Platform - Phase 4.2
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: SecuritySeverity;
  source: string;
  description: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  metadata?: Record<string, any>;
  blocked: boolean;
}

enum SecurityEventType {
  // 인증 관련
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  SESSION_EXPIRED = 'session_expired',
  
  // 인가 관련
  ACCESS_DENIED = 'access_denied',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  
  // 공격 탐지
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTACK = 'csrf_attack',
  BRUTE_FORCE_ATTACK = 'brute_force_attack',
  DDoS_ATTACK = 'ddos_attack',
  
  // 시스템 보안
  SECURITY_POLICY_VIOLATION = 'security_policy_violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  
  // 데이터 보안
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_EXPORT = 'data_export',
  
  // 기타
  SECURITY_CONFIG_CHANGE = 'security_config_change',
  MALWARE_DETECTED = 'malware_detected',
  VULNERABILITY_EXPLOIT = 'vulnerability_exploit'
}

enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface SecurityMetrics {
  totalEvents: number;
  eventsBySeverity: Record<SecuritySeverity, number>;
  eventsByType: Record<string, number>;
  blockedAttacks: number;
  suspiciousIPs: Set<string>;
  lastUpdate: Date;
}

class SecurityLogger extends EventEmitter {
  private events: SecurityEvent[] = [];
  private metrics: SecurityMetrics;
  private logFile: string;
  private maxEvents: number = 10000;
  private suspiciousIPs: Map<string, number> = new Map();
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    super();
    
    this.logFile = path.join(process.cwd(), 'logs', 'security.log');
    this.ensureLogDirectory();
    this.initializeMetrics();
    this.startPeriodicCleanup();
    
    console.log('📊 Security Logger initialized');
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private initializeMetrics(): void {
    this.metrics = {
      totalEvents: 0,
      eventsBySeverity: {
        [SecuritySeverity.LOW]: 0,
        [SecuritySeverity.MEDIUM]: 0,
        [SecuritySeverity.HIGH]: 0,
        [SecuritySeverity.CRITICAL]: 0
      },
      eventsByType: {},
      blockedAttacks: 0,
      suspiciousIPs: new Set(),
      lastUpdate: new Date()
    };
  }

  public logSecurityEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    description: string,
    source: string,
    metadata?: {
      ip?: string;
      userAgent?: string;
      userId?: string;
      blocked?: boolean;
      [key: string]: any;
    }
  ): string {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      type,
      severity,
      source,
      description,
      userAgent: metadata?.userAgent,
      ip: metadata?.ip,
      userId: metadata?.userId,
      metadata: metadata ? { ...metadata } : undefined,
      blocked: metadata?.blocked || false
    };

    // 메모리에 이벤트 저장
    this.events.push(event);
    
    // 이벤트 수 제한
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // 메트릭 업데이트
    this.updateMetrics(event);

    // 파일에 로그 기록
    this.writeToLogFile(event);

    // 의심스러운 IP 추적
    if (event.ip) {
      this.trackSuspiciousIP(event.ip, event);
    }

    // 이벤트 발생 알림
    this.emit('securityEvent', event);

    // 심각한 이벤트의 경우 즉시 알림
    if (severity === SecuritySeverity.CRITICAL || severity === SecuritySeverity.HIGH) {
      this.emit('criticalSecurityEvent', event);
    }

    console.log(`🚨 Security Event [${severity.toUpperCase()}]: ${description}`);
    
    return event.id;
  }

  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateMetrics(event: SecurityEvent): void {
    this.metrics.totalEvents++;
    this.metrics.eventsBySeverity[event.severity]++;
    
    const typeKey = event.type.toString();
    this.metrics.eventsByType[typeKey] = (this.metrics.eventsByType[typeKey] || 0) + 1;
    
    if (event.blocked) {
      this.metrics.blockedAttacks++;
    }
    
    if (event.ip) {
      this.metrics.suspiciousIPs.add(event.ip);
    }
    
    this.metrics.lastUpdate = new Date();
  }

  private writeToLogFile(event: SecurityEvent): void {
    try {
      const logEntry = {
        timestamp: event.timestamp.toISOString(),
        id: event.id,
        type: event.type,
        severity: event.severity,
        source: event.source,
        description: event.description,
        ip: event.ip,
        userAgent: event.userAgent,
        userId: event.userId,
        blocked: event.blocked,
        metadata: event.metadata
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('❌ Failed to write security log:', error);
    }
  }

  private trackSuspiciousIP(ip: string, event: SecurityEvent): void {
    const currentCount = this.suspiciousIPs.get(ip) || 0;
    const newCount = currentCount + (event.blocked ? 1 : 0.5);
    
    this.suspiciousIPs.set(ip, newCount);
    
    // 의심스러운 활동 임계값 초과 시 추가 보안 조치
    if (newCount >= 10) {
      this.logSecurityEvent(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        SecuritySeverity.HIGH,
        `IP ${ip} exceeded suspicious activity threshold (${newCount} incidents)`,
        'SecurityLogger',
        { ip, incidents: newCount, autoBlocked: true }
      );
    }
  }

  private startPeriodicCleanup(): void {
    // 매시간 정리 작업 실행
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000); // 1시간마다
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24시간 전
    
    // 오래된 의심스러운 IP 데이터 정리
    for (const [ip, resetTime] of this.rateLimits.entries()) {
      if (resetTime < Date.now()) {
        this.rateLimits.delete(ip);
      }
    }
    
    console.log('🧹 Security data cleanup completed');
  }

  // Public methods for querying security data
  public getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit).reverse();
  }

  public getEventsByType(type: SecurityEventType, limit: number = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit)
      .reverse();
  }

  public getEventsBySeverity(severity: SecuritySeverity, limit: number = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.severity === severity)
      .slice(-limit)
      .reverse();
  }

  public getEventsByIP(ip: string, limit: number = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.ip === ip)
      .slice(-limit)
      .reverse();
  }

  public getSecurityMetrics(): SecurityMetrics {
    return {
      ...this.metrics,
      suspiciousIPs: new Set(this.metrics.suspiciousIPs)
    };
  }

  public getSuspiciousIPs(): Array<{ ip: string; incidents: number }> {
    return Array.from(this.suspiciousIPs.entries())
      .map(([ip, incidents]) => ({ ip, incidents }))
      .sort((a, b) => b.incidents - a.incidents);
  }

  public isIPSuspicious(ip: string): boolean {
    const incidents = this.suspiciousIPs.get(ip) || 0;
    return incidents >= 5;
  }

  public blockIP(ip: string, reason: string): void {
    this.logSecurityEvent(
      SecurityEventType.SECURITY_CONFIG_CHANGE,
      SecuritySeverity.MEDIUM,
      `IP ${ip} manually blocked: ${reason}`,
      'SecurityLogger',
      { ip, blocked: true, action: 'manual_block' }
    );
  }

  public generateSecurityReport(hours: number = 24): object {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const recentEvents = this.events.filter(event => event.timestamp >= cutoffTime);
    
    const reportMetrics = {
      totalEvents: recentEvents.length,
      eventsBySeverity: {
        [SecuritySeverity.LOW]: 0,
        [SecuritySeverity.MEDIUM]: 0,
        [SecuritySeverity.HIGH]: 0,
        [SecuritySeverity.CRITICAL]: 0
      },
      eventsByType: {} as Record<string, number>,
      blockedAttacks: 0,
      uniqueIPs: new Set<string>()
    };
    
    recentEvents.forEach(event => {
      reportMetrics.eventsBySeverity[event.severity]++;
      
      const typeKey = event.type.toString();
      reportMetrics.eventsByType[typeKey] = (reportMetrics.eventsByType[typeKey] || 0) + 1;
      
      if (event.blocked) {
        reportMetrics.blockedAttacks++;
      }
      
      if (event.ip) {
        reportMetrics.uniqueIPs.add(event.ip);
      }
    });

    return {
      period: `Last ${hours} hours`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalEvents: reportMetrics.totalEvents,
        blockedAttacks: reportMetrics.blockedAttacks,
        uniqueIPs: reportMetrics.uniqueIPs.size,
        criticalEvents: reportMetrics.eventsBySeverity[SecuritySeverity.CRITICAL],
        highEvents: reportMetrics.eventsBySeverity[SecuritySeverity.HIGH]
      },
      eventsBySeverity: reportMetrics.eventsBySeverity,
      eventsByType: reportMetrics.eventsByType,
      topSuspiciousIPs: this.getSuspiciousIPs().slice(0, 10),
      recentCriticalEvents: this.getEventsBySeverity(SecuritySeverity.CRITICAL, 10)
    };
  }
}

// 보안 로거 인스턴스 생성 및 내보내기
const securityLogger = new SecurityLogger();

export { SecurityLogger, securityLogger, SecurityEventType, SecuritySeverity };
export type { SecurityEvent, SecurityMetrics };
