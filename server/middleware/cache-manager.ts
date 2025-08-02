/**
 * XPSwap 캐시 관리자
 * Phase 2.1: 데이터베이스 최적화
 * 
 * 메모리 기반 캐싱 시스템으로 API 응답 성능을 최적화합니다.
 */

import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  memoryUsage: number;
  entryCount: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    memoryUsage: 0,
    entryCount: 0
  };

  private readonly DEFAULT_TTL = 60 * 1000; // 60초
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5분

  constructor() {
    // 주기적으로 만료된 캐시 항목 정리
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);

    console.log('🔄 Cache Manager initialized');
  }

  /**
   * 캐시 키 생성
   */
  private generateKey(req: Request, customKey?: string): string {
    if (customKey) return customKey;
    
    const { method, path, query } = req;
    const queryString = Object.keys(query).length > 0 ? JSON.stringify(query) : '';
    return `${method}:${path}:${queryString}`;
  }

  /**
   * 캐시에서 데이터 조회
   */
  get(key: string): any | null {
    this.stats.totalRequests++;

    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.cacheMisses++;
      this.updateHitRate();
      return null;
    }

    // TTL 검사
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.cacheMisses++;
      this.updateHitRate();
      return null;
    }

    // 히트 수 증가
    entry.hits++;
    this.stats.cacheHits++;
    this.updateHitRate();

    return entry.data;
  }

  /**
   * 캐시에 데이터 저장
   */
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    // 캐시 크기 제한 확인
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    };

    this.cache.set(key, entry);
    this.updateStats();
  }

  /**
   * 특정 패턴의 캐시 무효화
   */
  invalidate(pattern: string): number {
    let deletedCount = 0;
    
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    this.updateStats();
    return deletedCount;
  }

  /**
   * 캐시 완전 초기화
   */
  clear(): void {
    this.cache.clear();
    this.updateStats();
    console.log('🧹 Cache cleared');
  }

  /**
   * LRU (Least Recently Used) 기반 캐시 제거
   */
  private evictLRU(): void {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 만료된 캐시 항목 정리
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned ${cleanedCount} expired cache entries`);
      this.updateStats();
    }
  }

  /**
   * 히트율 업데이트
   */
  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
      : 0;
  }

  /**
   * 캐시 통계 업데이트
   */
  private updateStats(): void {
    this.stats.entryCount = this.cache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
    this.updateHitRate();
  }

  /**
   * 메모리 사용량 추정
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache) {
      totalSize += key.length * 2; // 키 크기 (UTF-16)
      totalSize += JSON.stringify(entry.data).length * 2; // 데이터 크기
      totalSize += 32; // 메타데이터 크기 추정
    }

    return totalSize;
  }

  /**
   * 캐시 통계 조회
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * 인기 캐시 키 목록 조회
   */
  getPopularKeys(limit: number = 10): Array<{key: string, hits: number}> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, hits: entry.hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);

    return entries;
  }
}

// 싱글톤 인스턴스
const cacheManager = new CacheManager();

/**
 * Express 미들웨어: 캐시 조회
 */
export const cacheMiddleware = (ttl?: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = cacheManager.generateKey(req);
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
      cacheManager.set(key, data, ttl);
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Express 미들웨어: 캐시 무효화
 */
export const invalidateCacheMiddleware = (pattern: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const deletedCount = cacheManager.invalidate(pattern);
    console.log(`🗑️ Invalidated ${deletedCount} cache entries matching: ${pattern}`);
    next();
  };
};

/**
 * 캐시 관리자 인스턴스 내보내기
 */
export { cacheManager };

/**
 * 캐시 상태 조회 핸들러
 */
export const getCacheStats = (req: Request, res: Response) => {
  const stats = cacheManager.getStats();
  const popularKeys = cacheManager.getPopularKeys();

  res.json({
    cache: {
      stats,
      popularKeys,
      status: 'active',
      maxSize: 1000,
      cleanupInterval: '5 minutes'
    }
  });
};

export default cacheManager;
