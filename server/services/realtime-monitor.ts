/**
 * XPSwap 실시간 모니터링 시스템
 * Phase 2.3: Real-time Monitoring Dashboard
 * 
 * WebSocket 기반 실시간 성능 및 보안 모니터링
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { cacheManager } from '../middleware/cache-manager';
import apiOptimizer from './api-optimizer';

interface MonitoringMetrics {
  timestamp: number;
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    activeConnections: number;
  };
  cache: {
    hitRate: number;
    size: number;
    memoryUsage: number;
  };
  security: {
    rateLimitHits: number;
    suspiciousActivities: number;
    blockedRequests: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
}

interface AlertRule {
  id: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  enabled: boolean;
  message: string;
}

class RealtimeMonitor {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private metrics: MonitoringMetrics[] = [];
  private alertRules: Map<string, AlertRule> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly METRICS_RETENTION = 1000; // 최대 1000개 메트릭 보관
  private readonly MONITORING_INTERVAL = 5000; // 5초마다 모니터링

  constructor() {
    this.initializeDefaultAlerts();
    console.log('📊 Realtime Monitor initialized');
  }

  /**
   * WebSocket 서버 초기화
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/monitor'
    });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('📡 New monitoring client connected');
      this.clients.add(ws);

      // 클라이언트에게 최근 메트릭 전송
      const recentMetrics = this.metrics.slice(-10);
      ws.send(JSON.stringify({
        type: 'initial',
        data: recentMetrics
      }));

      ws.on('close', () => {
        console.log('📡 Monitoring client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('📡 WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    // 실시간 모니터링 시작
    this.startMonitoring();
    console.log('📊 WebSocket monitoring server started on /ws/monitor');
  }

  /**
   * 실시간 모니터링 시작
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.metrics.push(metrics);

        // 메트릭 개수 제한
        if (this.metrics.length > this.METRICS_RETENTION) {
          this.metrics.shift();
        }

        // 모든 클라이언트에게 전송
        this.broadcastMetrics(metrics);

        // 알림 규칙 확인
        this.checkAlerts(metrics);

      } catch (error) {
        console.error('📊 Monitoring error:', error);
      }
    }, this.MONITORING_INTERVAL);
  }

  /**
   * 메트릭 수집
   */
  private async collectMetrics(): Promise<MonitoringMetrics> {
    const performanceStats = apiOptimizer.getPerformanceStats();
    const cacheStats = cacheManager.getStats();
    
    // 시스템 메트릭 수집
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      timestamp: Date.now(),
      performance: {
        responseTime: this.calculateAverageResponseTime(performanceStats),
        throughput: this.calculateThroughput(performanceStats),
        errorRate: this.calculateErrorRate(),
        activeConnections: this.clients.size
      },
      cache: {
        hitRate: cacheStats.hitRate || 0,
        size: cacheStats.entryCount || 0,
        memoryUsage: cacheStats.memoryUsage || 0
      },
      security: {
        rateLimitHits: this.getSecurityMetric('rateLimitHits'),
        suspiciousActivities: this.getSecurityMetric('suspiciousActivities'),
        blockedRequests: this.getSecurityMetric('blockedRequests')
      },
      system: {
        cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // 마이크로초 -> 밀리초
        memoryUsage: memoryUsage.heapUsed / 1024 / 1024, // MB
        diskUsage: 0 // TODO: 디스크 사용량 구현
      }
    };
  }

  /**
   * 평균 응답 시간 계산
   */
  private calculateAverageResponseTime(stats: any): number {
    if (typeof stats !== 'object' || stats === null) return 0;
    
    const endpoints = Object.values(stats) as any[];
    if (endpoints.length === 0) return 0;
    
    const totalResponseTime = endpoints.reduce((sum, endpoint) => {
      return sum + (endpoint.averageResponseTime || 0);
    }, 0);
    
    return Math.round(totalResponseTime / endpoints.length);
  }

  /**
   * 처리량 계산 (분당 요청 수)
   */
  private calculateThroughput(stats: any): number {
    if (typeof stats !== 'object' || stats === null) return 0;
    
    const endpoints = Object.values(stats) as any[];
    const totalRequests = endpoints.reduce((sum, endpoint) => {
      return sum + (endpoint.totalRequests || 0);
    }, 0);
    
    // 5초 간격으로 수집하므로 12배하여 분당 계산
    return totalRequests * 12;
  }

  /**
   * 에러율 계산
   */
  private calculateErrorRate(): number {
    // TODO: 에러 추적 시스템 구현 필요
    return 0;
  }

  /**
   * 보안 메트릭 조회
   */
  private getSecurityMetric(metric: string): number {
    // TODO: 보안 메트릭 수집 시스템 구현 필요
    return 0;
  }

  /**
   * 모든 클라이언트에게 메트릭 브로드캐스트
   */
  private broadcastMetrics(metrics: MonitoringMetrics): void {
    const message = JSON.stringify({
      type: 'metrics',
      data: metrics
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('📡 Failed to send metrics to client:', error);
          this.clients.delete(client);
        }
      }
    });
  }

  /**
   * 알림 규칙 확인
   */
  private checkAlerts(metrics: MonitoringMetrics): void {
    for (const [id, rule] of this.alertRules) {
      if (!rule.enabled) continue;

      const value = this.getMetricValue(metrics, rule.metric);
      let triggered = false;

      switch (rule.condition) {
        case 'gt':
          triggered = value > rule.threshold;
          break;
        case 'lt':
          triggered = value < rule.threshold;
          break;
        case 'eq':
          triggered = value === rule.threshold;
          break;
      }

      if (triggered) {
        this.sendAlert(rule, value);
      }
    }
  }

  /**
   * 메트릭 값 추출
   */
  private getMetricValue(metrics: MonitoringMetrics, path: string): number {
    const parts = path.split('.');
    let value: any = metrics;
    
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return 0;
    }
    
    return typeof value === 'number' ? value : 0;
  }

  /**
   * 알림 전송
   */
  private sendAlert(rule: AlertRule, value: number): void {
    const alert = {
      type: 'alert',
      data: {
        id: rule.id,
        metric: rule.metric,
        message: rule.message.replace('{value}', value.toString()),
        value,
        threshold: rule.threshold,
        timestamp: Date.now()
      }
    };

    console.warn(`🚨 Alert triggered: ${alert.data.message}`);
    
    // 모든 클라이언트에게 알림 전송
    const message = JSON.stringify(alert);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('📡 Failed to send alert to client:', error);
        }
      }
    });
  }

  /**
   * 기본 알림 규칙 초기화
   */
  private initializeDefaultAlerts(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high-response-time',
        metric: 'performance.responseTime',
        condition: 'gt',
        threshold: 1000,
        enabled: true,
        message: 'High response time detected: {value}ms'
      },
      {
        id: 'low-cache-hit-rate',
        metric: 'cache.hitRate',
        condition: 'lt',
        threshold: 50,
        enabled: true,
        message: 'Low cache hit rate: {value}%'
      },
      {
        id: 'high-memory-usage',
        metric: 'system.memoryUsage',
        condition: 'gt',
        threshold: 500,
        enabled: true,
        message: 'High memory usage: {value}MB'
      },
      {
        id: 'high-cpu-usage',
        metric: 'system.cpuUsage',
        condition: 'gt',
        threshold: 80,
        enabled: true,
        message: 'High CPU usage: {value}%'
      }
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });

    console.log(`📊 Initialized ${defaultRules.length} default alert rules`);
  }

  /**
   * 알림 규칙 추가/수정
   */
  setAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    console.log(`📊 Alert rule updated: ${rule.id}`);
  }

  /**
   * 알림 규칙 삭제
   */
  deleteAlertRule(id: string): boolean {
    const result = this.alertRules.delete(id);
    if (result) {
      console.log(`📊 Alert rule deleted: ${id}`);
    }
    return result;
  }

  /**
   * 모든 알림 규칙 조회
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * 히스토리 메트릭 조회
   */
  getHistoricalMetrics(limit: number = 100): MonitoringMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * 통계 요약 조회
   */
  getStatsSummary(): any {
    if (this.metrics.length === 0) {
      return {
        period: '0 minutes',
        totalRequests: 0,
        averageResponseTime: 0,
        peakResponseTime: 0,
        cacheHitRate: 0,
        uptime: process.uptime()
      };
    }

    const recentMetrics = this.metrics.slice(-12); // 최근 1분 (5초 * 12)
    const responseTimes = recentMetrics.map(m => m.performance.responseTime);
    const cacheHitRates = recentMetrics.map(m => m.cache.hitRate);
    
    return {
      period: `${recentMetrics.length * 5} seconds`,
      totalRequests: recentMetrics.reduce((sum, m) => sum + m.performance.throughput, 0),
      averageResponseTime: responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length,
      peakResponseTime: Math.max(...responseTimes),
      cacheHitRate: cacheHitRates.reduce((sum, hr) => sum + hr, 0) / cacheHitRates.length,
      uptime: process.uptime(),
      activeClients: this.clients.size
    };
  }

  /**
   * 모니터링 중지
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    this.clients.clear();
    console.log('📊 Realtime monitoring stopped');
  }
}

// 싱글톤 인스턴스
const realtimeMonitor = new RealtimeMonitor();

export default realtimeMonitor;
export type { MonitoringMetrics, AlertRule };
