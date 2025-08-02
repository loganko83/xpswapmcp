/**
 * XPSwap Frontend Security Enhancement
 * Phase 3.1: Content Security Policy (CSP) Implementation
 * 
 * 프론트엔드 보안을 위한 CSP 정책 및 보안 헤더 관리
 */

interface CSPDirective {
  name: string;
  values: string[];
  description: string;
}

interface SecurityConfig {
  csp: {
    directives: CSPDirective[];
    reportOnly: boolean;
    reportUri?: string;
  };
  headers: {
    [key: string]: string;
  };
  features: {
    strictTransportSecurity: boolean;
    contentTypeOptions: boolean;
    frameOptions: boolean;
    xssProtection: boolean;
    referrerPolicy: boolean;
  };
}

class FrontendSecurityManager {
  private config: SecurityConfig;
  private isProduction: boolean;

  constructor(isProduction: boolean = false) {
    this.isProduction = isProduction;
    this.config = this.generateSecurityConfig();
  }

  /**
   * 보안 설정 생성
   */
  private generateSecurityConfig(): SecurityConfig {
    const baseConfig: SecurityConfig = {
      csp: {
        reportOnly: !this.isProduction,
        directives: [
          {
            name: 'default-src',
            values: ["'self'"],
            description: '기본 리소스 소스 제한'
          },
          {
            name: 'script-src',
            values: [
              "'self'",
              "'unsafe-inline'", // React 개발 환경에서 필요
              'https://cdn.jsdelivr.net', // Chart.js 등 CDN
              'https://unpkg.com', // 개발용 CDN
              ...(this.isProduction ? [] : ["'unsafe-eval'"]) // 개발 환경에서만 허용
            ],
            description: '스크립트 소스 제한'
          },
          {
            name: 'style-src',
            values: [
              "'self'",
              "'unsafe-inline'", // Tailwind CSS inline styles
              'https://fonts.googleapis.com',
              'https://cdn.jsdelivr.net'
            ],
            description: '스타일 시트 소스 제한'
          },
          {
            name: 'font-src',
            values: [
              "'self'",
              'https://fonts.gstatic.com',
              'data:'
            ],
            description: '폰트 소스 제한'
          },
          {
            name: 'img-src',
            values: [
              "'self'",
              'data:',
              'https:',
              'https://assets.coingecko.com', // 암호화폐 이미지
              'https://cryptologos.cc', // 토큰 로고
              'https://raw.githubusercontent.com' // GitHub 이미지
            ],
            description: '이미지 소스 제한'
          },
          {
            name: 'connect-src',
            values: [
              "'self'",
              'https://www.ankr.com', // Xphere RPC
              'https://api.coingecko.com', // 가격 데이터
              'https://api.coinmarketcap.com', // 시장 데이터
              'wss://www.ankr.com', // WebSocket connections
              'ws://localhost:*', // 개발 환경 WebSocket
              'https://li.quest', // Li.Fi bridge
              ...(this.isProduction ? [] : ['ws://localhost:*', 'http://localhost:*'])
            ],
            description: 'AJAX, WebSocket 등 연결 제한'
          },
          {
            name: 'frame-src',
            values: ["'none'"],
            description: 'iframe 사용 금지'
          },
          {
            name: 'object-src',
            values: ["'none'"],
            description: 'object, embed 태그 사용 금지'
          },
          {
            name: 'base-uri',
            values: ["'self'"],
            description: 'base 태그 URI 제한'
          },
          {
            name: 'form-action',
            values: ["'self'"],
            description: 'form action 제한'
          },
          {
            name: 'frame-ancestors',
            values: ["'self'"],
            description: '상위 프레임 제한'
          },
          {
            name: 'script-src-attr',
            values: ["'none'"],
            description: '인라인 이벤트 핸들러 금지'
          }
        ]
      },
      headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Origin-Agent-Cluster': '?1'
      },
      features: {
        strictTransportSecurity: this.isProduction,
        contentTypeOptions: true,
        frameOptions: true,
        xssProtection: true,
        referrerPolicy: true
      }
    };

    return baseConfig;
  }

  /**
   * CSP 문자열 생성
   */
  generateCSPString(): string {
    const directives = this.config.csp.directives
      .map(directive => `${directive.name} ${directive.values.join(' ')}`)
      .join('; ');
    
    return directives;
  }

  /**
   * Express 미들웨어 생성
   */
  getExpressMiddleware() {
    return (req: any, res: any, next: any) => {
      // CSP 헤더 설정
      const cspHeaderName = this.config.csp.reportOnly 
        ? 'Content-Security-Policy-Report-Only' 
        : 'Content-Security-Policy';
      
      res.setHeader(cspHeaderName, this.generateCSPString());

      // 추가 보안 헤더 설정
      Object.entries(this.config.headers).forEach(([name, value]) => {
        if (name === 'Strict-Transport-Security' && !this.config.features.strictTransportSecurity) {
          return; // HTTPS가 아닌 경우 HSTS 헤더 제외
        }
        res.setHeader(name, value);
      });

      // 개발 환경에서 추가 헤더
      if (!this.isProduction) {
        res.setHeader('X-Development-Mode', 'true');
      }

      next();
    };
  }

  /**
   * CSP 위반 리포트 핸들러
   */
  getCSPReportHandler() {
    return (req: any, res: any) => {
      const report = req.body;
      
      console.warn('🚨 CSP Violation Report:', {
        'blocked-uri': report['blocked-uri'],
        'document-uri': report['document-uri'],
        'violated-directive': report['violated-directive'],
        'original-policy': report['original-policy'],
        timestamp: new Date().toISOString()
      });

      // 프로덕션 환경에서는 로그 시스템에 기록
      if (this.isProduction) {
        this.logCSPViolation(report);
      }

      res.status(204).end();
    };
  }

  /**
   * CSP 위반 로그 기록
   */
  private logCSPViolation(report: any) {
    // TODO: 실제 로그 시스템과 연동
    console.log('CSP Violation logged:', report);
  }

  /**
   * 보안 설정 상태 반환
   */
  getSecurityStatus() {
    return {
      csp: {
        enabled: true,
        reportOnly: this.config.csp.reportOnly,
        directiveCount: this.config.csp.directives.length
      },
      headers: {
        count: Object.keys(this.config.headers).length,
        hsts: this.config.features.strictTransportSecurity
      },
      environment: this.isProduction ? 'production' : 'development'
    };
  }

  /**
   * 허용된 도메인 추가 (런타임)
   */
  addAllowedDomain(directive: string, domain: string) {
    const dir = this.config.csp.directives.find(d => d.name === directive);
    if (dir && !dir.values.includes(domain)) {
      dir.values.push(domain);
      console.log(`✅ Added ${domain} to ${directive} directive`);
    }
  }

  /**
   * 보안 설정 검증
   */
  validateConfiguration(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // 필수 지시어 확인
    const requiredDirectives = ['default-src', 'script-src', 'style-src'];
    requiredDirectives.forEach(directive => {
      if (!this.config.csp.directives.find(d => d.name === directive)) {
        issues.push(`Missing required CSP directive: ${directive}`);
      }
    });

    // 위험한 설정 확인
    const scriptSrc = this.config.csp.directives.find(d => d.name === 'script-src');
    if (scriptSrc) {
      if (scriptSrc.values.includes("'unsafe-eval'") && this.isProduction) {
        issues.push("'unsafe-eval' should not be used in production");
      }
      if (scriptSrc.values.includes("'unsafe-inline'") && this.isProduction) {
        console.warn("⚠️ 'unsafe-inline' in script-src may be risky in production");
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export default FrontendSecurityManager;