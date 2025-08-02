/**
 * XPSwap API 성능 최적화 서비스
 * Phase 2.2: API 캐싱 및 비동기 처리
 * 
 * 고성능 비동기 처리와 스마트 캐싱을 통한 API 응답 속도 최적화
 */

import { Request, Response, NextFunction } from 'express';
import { cacheManager } from '../middleware/cache-manager';

interface PerformanceMetrics {
  responseTime: number;
  cacheHit: boolean;
  cacheKey?: string;
  timestamp: number;
  endpoint: string;
  method: string;
}

interface AsyncTaskResult {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class APIPerformanceOptimizer {
  private performanceMetrics: Map<string, PerformanceMetrics[]> = new Map();
  private asyncTasks: Map<string, AsyncTaskResult> = new Map();
  private readonly MAX_METRICS_PER_ENDPOINT = 100;
  private readonly TASK_CLEANUP_INTERVAL = 15 * 60 * 1000; // 15분

  constructor() {
    // 주기적으로 완료된 작업 정리
    setInterval(() => {
      this.cleanupCompletedTasks();
    }, this.TASK_CLEANUP_INTERVAL);

    console.log('🚀 API Performance Optimizer initialized');
  }

  /**
   * 성능 모니터링 미들웨어
   */
  performanceMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const endpoint = req.path;
    const method = req.method;

    // 원본 json 메서드 저장
    const originalJson = res.json;
    const self = this; // this 컨텍스트 보존

    // 응답 시간 측정 및 메트릭 수집
    res.json = function(data: any) {
      const responseTime = Date.now() - startTime;
      const cacheHit = res.getHeader('X-Cache') === 'HIT';
      const cacheKey = res.getHeader('X-Cache-Key') as string;

      // 메트릭 저장
      const metric: PerformanceMetrics = {
        responseTime,
        cacheHit,
        cacheKey,
        timestamp: Date.now(),
        endpoint,
        method
      };

      const endpointMetrics = self.performanceMetrics.get(endpoint) || [];
      endpointMetrics.push(metric);

      // 메트릭 크기 제한
      if (endpointMetrics.length > self.MAX_METRICS_PER_ENDPOINT) {
        endpointMetrics.shift();
      }

      self.performanceMetrics.set(endpoint, endpointMetrics);

      // 응답 헤더에 성능 정보 추가
      res.setHeader('X-Response-Time', responseTime.toString());
      res.setHeader('X-Performance-Optimized', 'true');

      return originalJson.call(this, data);
    };

    next();
  };

  /**
   * 스마트 캐싱 미들웨어 (조건부 캐싱)
   */
  smartCachingMiddleware = (options: {
    ttl?: number;
    condition?: (req: Request) => boolean;
    invalidateOn?: string[];
  } = {}) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // 캐싱 조건 확인
      if (options.condition && !options.condition(req)) {
        return next();
      }

      // GET 요청만 캐싱
      if (req.method !== 'GET') {
        return next();
      }

      const key = this.generateCacheKey(req);
      const cachedData = cacheManager.get(key);

      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', key);
        return res.json(cachedData);
      }

      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', key);

      // 원본 json 메서드 저장
      const originalJson = res.json;

      // json 메서드 오버라이드하여 캐시 저장
      res.json = function(data: any) {
        // 성공적인 응답만 캐싱
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheManager.set(key, data, options.ttl);
        }
        return originalJson.call(this, data);
      };

      next();
    };
  };

  /**
   * 비동기 작업 처리 (롱 러닝 작업용)
   */
  async createAsyncTask<T>(
    taskId: string,
    taskFunction: () => Promise<T>
  ): Promise<string> {
    const task: AsyncTaskResult = {
      id: taskId,
      status: 'pending',
      startTime: Date.now()
    };

    this.asyncTasks.set(taskId, task);

    // 비동기로 작업 실행
    this.executeAsyncTask(taskId, taskFunction);

    return taskId;
  }

  /**
   * 비동기 작업 실행
   */
  private async executeAsyncTask<T>(
    taskId: string,
    taskFunction: () => Promise<T>
  ): Promise<void> {
    const task = this.asyncTasks.get(taskId);
    if (!task) return;

    try {
      const result = await taskFunction();
      
      task.status = 'completed';
      task.result = result;
      task.endTime = Date.now();
      task.duration = task.endTime - task.startTime;

      this.asyncTasks.set(taskId, task);
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.endTime = Date.now();
      task.duration = task.endTime! - task.startTime;

      this.asyncTasks.set(taskId, task);
    }
  }

  /**
   * 비동기 작업 상태 조회
   */
  getAsyncTaskStatus(taskId: string): AsyncTaskResult | null {
    return this.asyncTasks.get(taskId) || null;
  }

  /**
   * 완료된 작업 정리
   */
  private cleanupCompletedTasks(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [taskId, task] of this.asyncTasks) {
      // 15분 이상 지난 완료된 작업 삭제
      if (task.endTime && (now - task.endTime > this.TASK_CLEANUP_INTERVAL)) {
        this.asyncTasks.delete(taskId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned ${cleanedCount} completed async tasks`);
    }
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(req: Request): string {
    const { method, path, query, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const accept = headers['accept'] || '';
    
    // 쿼리 파라미터 정렬 (일관된 키 생성)
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce((result, key) => {
        result[key] = query[key];
        return result;
      }, {} as any);

    const keyData = {
      method,
      path,
      query: sortedQuery,
      userAgent: userAgent.substring(0, 50), // UA 일부만 사용
      accept: accept.substring(0, 30) // Accept 헤더 일부만 사용
    };

    return 'api:' + Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  /**
   * 엔드포인트별 성능 통계 조회
   */
  getPerformanceStats(endpoint?: string): any {
    if (endpoint) {
      const metrics = this.performanceMetrics.get(endpoint) || [];
      return this.calculateStats(metrics, endpoint);
    }

    // 모든 엔드포인트 통계
    const allStats: any = {};
    for (const [ep, metrics] of this.performanceMetrics) {
      allStats[ep] = this.calculateStats(metrics, ep);
    }

    return allStats;
  }

  /**
   * 통계 계산
   */
  private calculateStats(metrics: PerformanceMetrics[], endpoint: string): any {
    if (metrics.length === 0) {
      return {
        endpoint,
        totalRequests: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0
      };
    }

    const responseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b);
    const cacheHits = metrics.filter(m => m.cacheHit).length;
    
    const totalRequests = metrics.length;
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;
    const cacheHitRate = (cacheHits / totalRequests) * 100;
    
    // 백분위수 계산
    const p95Index = Math.floor(totalRequests * 0.95);
    const p99Index = Math.floor(totalRequests * 0.99);
    
    return {
      endpoint,
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      minResponseTime: responseTimes[0] || 0,
      maxResponseTime: responseTimes[responseTimes.length - 1] || 0
    };
  }

  /**
   * 비동기 작업 목록 조회
   */
  getAsyncTasks(): AsyncTaskResult[] {
    return Array.from(this.asyncTasks.values());
  }

  /**
   * 캐시 워밍업 (자주 사용되는 데이터 미리 로드)
   */
  async warmupCache(endpoints: string[]): Promise<void> {
    console.log('🔥 Starting cache warmup...');
    
    for (const endpoint of endpoints) {
      try {
        // 실제 구현에서는 각 엔드포인트에 대한 테스트 요청을 보냄
        console.log(`🔥 Warming up cache for ${endpoint}`);
        
        // 예시: 가상의 요청으로 캐시 채우기
        const mockReq = { path: endpoint, method: 'GET', query: {} } as Request;
        const cacheKey = this.generateCacheKey(mockReq);
        
        // 실제 데이터 로드 로직은 각 API별로 다름
        // 여기서는 기본 데이터만 캐싱
        cacheManager.set(cacheKey, { cached: true, warmedUp: true }, 60000);
        
      } catch (error) {
        console.error(`❌ Cache warmup failed for ${endpoint}:`, error);
      }
    }
    
    console.log('✅ Cache warmup completed');
  }
}

// 싱글톤 인스턴스
const apiOptimizer = new APIPerformanceOptimizer();

/**
 * Express 라우트 핸들러들
 */

export const getPerformanceStats = (req: Request, res: Response) => {
  const { endpoint } = req.query;
  const stats = apiOptimizer.getPerformanceStats(endpoint as string);
  
  res.json({
    success: true,
    data: stats,
    timestamp: Date.now()
  });
};

export const getAsyncTaskStatus = (req: Request, res: Response) => {
  const { taskId } = req.params;
  const task = apiOptimizer.getAsyncTaskStatus(taskId);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
      timestamp: Date.now()
    });
  }
  
  res.json({
    success: true,
    data: task,
    timestamp: Date.now()
  });
};

export const listAsyncTasks = (req: Request, res: Response) => {
  const tasks = apiOptimizer.getAsyncTasks();
  
  res.json({
    success: true,
    data: {
      tasks,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length
    },
    timestamp: Date.now()
  });
};

export const warmupCache = async (req: Request, res: Response) => {
  try {
    const { endpoints } = req.body;
    
    if (!endpoints || !Array.isArray(endpoints)) {
      return res.status(400).json({
        success: false,
        error: 'endpoints array is required',
        timestamp: Date.now()
      });
    }
    
    // 비동기 작업으로 캐시 워밍업 실행
    const taskId = `cache-warmup-${Date.now()}`;
    await apiOptimizer.createAsyncTask(taskId, () => 
      apiOptimizer.warmupCache(endpoints)
    );
    
    res.json({
      success: true,
      data: {
        taskId,
        message: 'Cache warmup started',
        endpoints: endpoints.length
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Cache warmup error:', error);
    res.status(500).json({
      success: false,
      error: 'Cache warmup failed',
      timestamp: Date.now()
    });
  }
};

// 미들웨어 내보내기
export const performanceMonitoringMiddleware = apiOptimizer.performanceMonitoringMiddleware;
export const smartCachingMiddleware = apiOptimizer.smartCachingMiddleware;

// API 엔드포인트 핸들러들
export const getPerformanceMetrics = getPerformanceStats;
export const optimizeAPI = warmupCache;
export const analyzeCacheUsage = (req: Request, res: Response) => {
  const cacheStats = cacheManager.getStats();
  const performanceStats = apiOptimizer.getPerformanceStats();
  
  res.json({
    success: true,
    data: {
      cache: cacheStats,
      performance: performanceStats,
      recommendations: generateOptimizationRecommendations(performanceStats, cacheStats)
    },
    timestamp: Date.now()
  });
};

// 최적화 권장사항 생성
function generateOptimizationRecommendations(performanceStats: any, cacheStats: any): string[] {
  const recommendations: string[] = [];
  
  // 성능 통계 기반 권장사항
  if (typeof performanceStats === 'object' && performanceStats !== null) {
    for (const [endpoint, stats] of Object.entries(performanceStats)) {
      const endpointStats = stats as any;
      
      if (endpointStats.averageResponseTime > 1000) {
        recommendations.push(`${endpoint}: Consider optimizing - average response time is ${endpointStats.averageResponseTime}ms`);
      }
      
      if (endpointStats.cacheHitRate < 50) {
        recommendations.push(`${endpoint}: Low cache hit rate (${endpointStats.cacheHitRate}%) - consider implementing caching`);
      }
      
      if (endpointStats.p95ResponseTime > 2000) {
        recommendations.push(`${endpoint}: High P95 response time (${endpointStats.p95ResponseTime}ms) - investigate slow queries`);
      }
    }
  }
  
  // 캐시 통계 기반 권장사항
  if (cacheStats && typeof cacheStats === 'object') {
    const hitRate = (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100;
    
    if (hitRate < 70) {
      recommendations.push('Overall cache hit rate is below 70% - consider reviewing cache TTL settings');
    }
    
    if (cacheStats.memoryUsage && cacheStats.memoryUsage > 0.8) {
      recommendations.push('Cache memory usage is high - consider implementing cache eviction policies');
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All performance metrics are within acceptable ranges');
  }
  
  return recommendations;
}

export default apiOptimizer;
