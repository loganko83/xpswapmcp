/**
 * XPSwap CSRF Protection System
 * Phase 3.3: Cross-Site Request Forgery Prevention
 * 
 * CSRF 공격을 방지하고 토큰 기반 검증을 제공
 */

import { randomBytes, createHash } from 'crypto';
import { Request, Response, NextFunction } from 'express';

interface CSRFToken {
  token: string;
  timestamp: number;
  sessionId: string;
  isValid: boolean;
}

interface CSRFConfig {
  tokenLength: number;
  maxAge: number; // milliseconds
  secretKey: string;
  ignoreMethods: string[];
  trustedOrigins: string[];
  enableDoubleSubmitCookie: boolean;
}

class CSRFProtectionManager {
  private static instance: CSRFProtectionManager;
  private config: CSRFConfig;
  private tokenStore: Map<string, CSRFToken>;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.config = {
      tokenLength: 32,
      maxAge: 3600000, // 1 hour
      secretKey: process.env.CSRF_SECRET || 'xpswap-csrf-default-secret',
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
      trustedOrigins: [
        'http://localhost:5173',
        'http://localhost:5000',
        'http://localhost:5195',
        'https://trendy.storydot.kr'
      ],
      enableDoubleSubmitCookie: true
    };

    this.tokenStore = new Map();
    
    // 만료된 토큰 정리 인터벌 (5분마다)
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 300000);
  }

  static getInstance(): CSRFProtectionManager {
    if (!CSRFProtectionManager.instance) {
      CSRFProtectionManager.instance = new CSRFProtectionManager();
    }
    return CSRFProtectionManager.instance;
  }

  /**
   * CSRF 토큰 생성
   */
  generateToken(sessionId: string): CSRFToken {
    const tokenData = randomBytes(this.config.tokenLength).toString('hex');
    const timestamp = Date.now();
    
    // 토큰에 세션 ID와 타임스탬프를 포함하여 보안 강화
    const payload = `${tokenData}.${sessionId}.${timestamp}`;
    const signature = this.signToken(payload);
    const token = `${payload}.${signature}`;

    const csrfToken: CSRFToken = {
      token,
      timestamp,
      sessionId,
      isValid: true
    };

    this.tokenStore.set(token, csrfToken);
    return csrfToken;
  }

  /**
   * 토큰 서명 생성
   */
  private signToken(payload: string): string {
    return createHash('sha256')
      .update(payload + this.config.secretKey)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * CSRF 토큰 검증
   */
  validateToken(token: string, sessionId: string): boolean {
    if (!token) {
      return false;
    }

    // 토큰 형식 검증
    const parts = token.split('.');
    if (parts.length !== 4) {
      return false;
    }

    const [tokenData, tokenSessionId, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr);

    // 토큰 저장소에서 확인
    const storedToken = this.tokenStore.get(token);
    if (!storedToken || !storedToken.isValid) {
      return false;
    }

    // 세션 ID 검증
    if (tokenSessionId !== sessionId) {
      return false;
    }

    // 타임스탬프 검증 (만료 체크)
    if (Date.now() - timestamp > this.config.maxAge) {
      this.invalidateToken(token);
      return false;
    }

    // 서명 검증
    const payload = `${tokenData}.${tokenSessionId}.${timestampStr}`;
    const expectedSignature = this.signToken(payload);
    if (signature !== expectedSignature) {
      return false;
    }

    return true;
  }

  /**
   * 토큰 무효화
   */
  invalidateToken(token: string): void {
    const storedToken = this.tokenStore.get(token);
    if (storedToken) {
      storedToken.isValid = false;
    }
  }

  /**
   * 만료된 토큰 정리
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [token, tokenData] of this.tokenStore.entries()) {
      if (now - tokenData.timestamp > this.config.maxAge) {
        this.tokenStore.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 CSRF: Cleaned up ${cleanedCount} expired tokens`);
    }
  }

  /**
   * Origin 헤더 검증
   */
  validateOrigin(origin: string): boolean {
    if (!origin) {
      return false;
    }

    return this.config.trustedOrigins.some(trustedOrigin => 
      origin === trustedOrigin || 
      (trustedOrigin.endsWith('*') && origin.startsWith(trustedOrigin.slice(0, -1)))
    );
  }

  /**
   * Referer 헤더 검증
   */
  validateReferer(referer: string, host: string): boolean {
    if (!referer) {
      return false;
    }

    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === host || 
             this.config.trustedOrigins.some(origin => {
               try {
                 const trustedUrl = new URL(origin);
                 return refererUrl.host === trustedUrl.host;
               } catch {
                 return false;
               }
             });
    } catch {
      return false;
    }
  }

  /**
   * CSRF 통계 정보
   */
  getStats() {
    const now = Date.now();
    let validTokens = 0;
    let expiredTokens = 0;
    let invalidTokens = 0;

    for (const tokenData of this.tokenStore.values()) {
      if (!tokenData.isValid) {
        invalidTokens++;
      } else if (now - tokenData.timestamp > this.config.maxAge) {
        expiredTokens++;
      } else {
        validTokens++;
      }
    }

    return {
      totalTokens: this.tokenStore.size,
      validTokens,
      expiredTokens,
      invalidTokens,
      maxAge: this.config.maxAge,
      trustedOrigins: this.config.trustedOrigins.length
    };
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<CSRFConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 정리 작업
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.tokenStore.clear();
  }
}

/**
 * 세션 ID 추출 유틸리티
 */
function getSessionId(req: Request): string {
  // 세션에서 ID 추출
  if (req.session && req.session.id) {
    return req.session.id;
  }
  
  // 쿠키에서 세션 ID 추출
  if (req.cookies && req.cookies['connect.sid']) {
    return req.cookies['connect.sid'];
  }
  
  // IP + User-Agent 기반 임시 ID (fallback)
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  return createHash('md5').update(`${ip}-${userAgent}`).digest('hex');
}

/**
 * CSRF 토큰 생성 미들웨어
 */
export function csrfTokenMiddleware() {
  const csrf = CSRFProtectionManager.getInstance();

  return (req: Request, res: Response, next: NextFunction) => {
    const sessionId = getSessionId(req);
    
    // 토큰 생성
    const tokenData = csrf.generateToken(sessionId);
    
    // 응답에 토큰 추가
    res.locals.csrfToken = tokenData.token;
    
    // Double Submit Cookie 패턴 적용
    if (csrf['config'].enableDoubleSubmitCookie) {
      res.cookie('XSRF-TOKEN', tokenData.token, {
        httpOnly: false, // JavaScript에서 접근 가능해야 함
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: csrf['config'].maxAge
      });
    }

    next();
  };
}

/**
 * CSRF 보호 미들웨어
 */
export function csrfProtectionMiddleware() {
  const csrf = CSRFProtectionManager.getInstance();

  return (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    
    // GET, HEAD, OPTIONS 요청은 보호하지 않음
    if (csrf['config'].ignoreMethods.includes(method)) {
      return next();
    }

    const sessionId = getSessionId(req);
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const host = req.get('Host');

    // Origin 헤더 검증
    if (origin && !csrf.validateOrigin(origin)) {
      return res.status(403).json({
        success: false,
        message: 'CSRF: Invalid origin',
        code: 'CSRF_INVALID_ORIGIN'
      });
    }

    // Referer 헤더 검증 (Origin이 없는 경우)
    if (!origin && referer && !csrf.validateReferer(referer, host || '')) {
      return res.status(403).json({
        success: false,
        message: 'CSRF: Invalid referer',
        code: 'CSRF_INVALID_REFERER'
      });
    }

    // CSRF 토큰 추출
    let token = req.get('X-CSRF-Token') || 
                req.get('X-XSRF-Token') || 
                req.body?._csrf ||
                req.query?._csrf;

    // Double Submit Cookie에서 토큰 추출
    if (!token && req.cookies && req.cookies['XSRF-TOKEN']) {
      token = req.cookies['XSRF-TOKEN'];
    }

    // 토큰 검증
    if (!token || !csrf.validateToken(token, sessionId)) {
      return res.status(403).json({
        success: false,
        message: 'CSRF: Invalid or missing token',
        code: 'CSRF_INVALID_TOKEN'
      });
    }

    next();
  };
}

/**
 * CSRF 토큰 API 엔드포인트
 */
export function csrfTokenEndpoint() {
  const csrf = CSRFProtectionManager.getInstance();

  return (req: Request, res: Response) => {
    const sessionId = getSessionId(req);
    const tokenData = csrf.generateToken(sessionId);

    res.json({
      success: true,
      csrfToken: tokenData.token,
      timestamp: tokenData.timestamp,
      maxAge: csrf['config'].maxAge
    });
  };
}

/**
 * CSRF 통계 API 엔드포인트
 */
export function csrfStatsEndpoint() {
  const csrf = CSRFProtectionManager.getInstance();

  return (req: Request, res: Response) => {
    const stats = csrf.getStats();
    
    res.json({
      success: true,
      stats,
      timestamp: Date.now()
    });
  };
}

export default CSRFProtectionManager;
