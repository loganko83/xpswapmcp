import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// 보안 키 생성 유틸리티
export class SecurityKeyGenerator {
  
  /**
   * 강력한 랜덤 문자열 생성
   * @param length 생성할 문자열 길이
   * @param includeSpecialChars 특수문자 포함 여부
   * @returns 보안 랜덤 문자열
   */
  static generateSecureRandomString(length: number = 64, includeSpecialChars: boolean = true): string {
    const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const charset = includeSpecialChars ? alphanumeric + specialChars : alphanumeric;
    
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      result += charset[randomIndex];
    }
    
    return result;
  }

  /**
   * JWT Secret 생성 (최소 256비트)
   */
  static generateJWTSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Session Secret 생성
   */
  static generateSessionSecret(): string {
    return crypto.randomBytes(64).toString('base64url');
  }

  /**
   * API 키 생성 (UUID 기반)
   */
  static generateAPIKey(): string {
    return crypto.randomUUID() + '-' + crypto.randomUUID();
  }

  /**
   * 암호화 키 생성 (AES-256)
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 개발/프로덕션용 보안 환경 변수 세트 생성
   */
  static generateSecurityEnvSet() {
    return {
      SESSION_SECRET: this.generateSessionSecret(),
      JWT_SECRET: this.generateJWTSecret(),
      JWT_REFRESH_SECRET: this.generateJWTSecret(),
      ENCRYPTION_KEY: this.generateEncryptionKey(),
      API_SECRET_KEY: this.generateAPIKey(),
      CSRF_SECRET: this.generateSecureRandomString(32, false),
      WEBHOOK_SECRET: this.generateSecureRandomString(48, false),
      ADMIN_SECRET: this.generateSecureRandomString(24, false)
    };
  }

  /**
   * 환경별 설정 검증
   */
  static validateEnvironmentSecurity(env: Record<string, any>): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 필수 보안 키 검증
    const requiredSecrets = ['SESSION_SECRET', 'JWT_SECRET'];
    requiredSecrets.forEach(key => {
      if (!env[key] || env[key].includes('CHANGE_THIS') || env[key].length < 32) {
        issues.push(`${key}이 설정되지 않았거나 보안이 약합니다.`);
        recommendations.push(`${key}에 최소 32자 이상의 강력한 랜덤 문자열을 설정하세요.`);
      }
    });

    // API 키 검증
    const apiKeys = ['COINMARKETCAP_API_KEY', 'VITE_INFURA_API_URL', 'VITE_ALCHEMY_API_KEY'];
    apiKeys.forEach(key => {
      if (!env[key] || env[key].includes('YOUR_') || env[key].includes('PLACEHOLDER')) {
        issues.push(`${key}가 실제 값으로 설정되지 않았습니다.`);
        recommendations.push(`${key}에 실제 API 키를 설정하세요.`);
      }
    });

    // 프로덕션 환경 특별 검증
    if (env.NODE_ENV === 'production') {
      if (env.DETAILED_ERRORS === 'true') {
        issues.push('프로덕션에서 상세 에러가 활성화되어 있습니다.');
        recommendations.push('DETAILED_ERRORS를 false로 설정하세요.');
      }

      if (!env.HTTPS || env.HTTPS !== 'true') {
        issues.push('프로덕션에서 HTTPS가 비활성화되어 있습니다.');
        recommendations.push('HTTPS를 true로 설정하세요.');
      }

      if (env.RATE_LIMIT_ENABLED !== 'true') {
        issues.push('프로덕션에서 Rate Limiting이 비활성화되어 있습니다.');
        recommendations.push('RATE_LIMIT_ENABLED를 true로 설정하세요.');
      }
    }

    // 개인키 검증
    if (env.DEPLOYER_PRIVATE_KEY && env.DEPLOYER_PRIVATE_KEY.includes('YOUR_')) {
      issues.push('배포용 개인키가 플레이스홀더 상태입니다.');
      recommendations.push('실제 배포용 개인키를 안전하게 설정하세요. (개발환경에서는 테스트넷 키만 사용)');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * 보안 강화된 .env 파일 생성
   */
  static generateSecureEnvFile(environment: 'development' | 'production'): string {
    const securityKeys = this.generateSecurityEnvSet();
    const timestamp = new Date().toISOString();
    
    const envContent = `# XPSwap 보안 강화 환경 설정 (${environment})
# 생성일: ${timestamp}
# ⚠️  이 파일에는 민감한 정보가 포함되어 있습니다. 안전하게 보관하세요.

# =============================================================================
# 보안 키 (자동 생성됨 - 절대 공유하지 마세요)
# =============================================================================
SESSION_SECRET=${securityKeys.SESSION_SECRET}
JWT_SECRET=${securityKeys.JWT_SECRET}
JWT_REFRESH_SECRET=${securityKeys.JWT_REFRESH_SECRET}
ENCRYPTION_KEY=${securityKeys.ENCRYPTION_KEY}
API_SECRET_KEY=${securityKeys.API_SECRET_KEY}
CSRF_SECRET=${securityKeys.CSRF_SECRET}
WEBHOOK_SECRET=${securityKeys.WEBHOOK_SECRET}
ADMIN_SECRET=${securityKeys.ADMIN_SECRET}

# =============================================================================
# 데이터베이스 설정
# =============================================================================
DATABASE_URL=sqlite:./test.db
DB_ENCRYPTION_KEY=${this.generateEncryptionKey()}

# =============================================================================
# 외부 API 키 (실제 키로 교체 필요)
# =============================================================================
COINMARKETCAP_API_KEY=${environment === 'production' ? 'REPLACE_WITH_ACTUAL_COINMARKETCAP_KEY' : 'development_test_key'}
INFURA_PROJECT_ID=${environment === 'production' ? 'REPLACE_WITH_ACTUAL_INFURA_PROJECT_ID' : 'development_test_id'}
ALCHEMY_API_KEY=${environment === 'production' ? 'REPLACE_WITH_ACTUAL_ALCHEMY_KEY' : 'development_test_key'}
LIFI_API_KEY=${environment === 'production' ? 'REPLACE_WITH_ACTUAL_LIFI_KEY' : 'development_test_key'}

# =============================================================================
# 환경 설정
# =============================================================================
NODE_ENV=${environment}
PORT=5000
HOST=${environment === 'production' ? '0.0.0.0' : 'localhost'}
BASE_PATH=${environment === 'production' ? '/xpswap' : ''}

# =============================================================================
# Xphere 블록체인 설정
# =============================================================================
XPHERE_RPC_URL=https://www.ankr.com/rpc/xphere/
XPHERE_CHAIN_ID=20250217
BACKUP_RPC_URL_1=https://rpc.xphere.network
BACKUP_RPC_URL_2=https://xphere-rpc.ankr.com

# =============================================================================
# 스마트 컨트랙트 설정
# =============================================================================
${environment === 'production' ? 
  '# ⚠️  프로덕션: 실제 메인넷 키로 교체 필요\nDEPLOYER_PRIVATE_KEY=REPLACE_WITH_ACTUAL_MAINNET_PRIVATE_KEY' :
  '# 개발환경: 테스트넷 키만 사용\nDEPLOYER_PRIVATE_KEY=REPLACE_WITH_TESTNET_PRIVATE_KEY'
}
GAS_PRICE=20000000000
GAS_LIMIT=8000000
REPORT_GAS=${environment === 'development' ? 'true' : 'false'}

# 컨트랙트 주소 (배포 후 업데이트)
XPS_TOKEN_ADDRESS=
DEX_ROUTER_ADDRESS=
LIQUIDITY_POOL_ADDRESS=
STAKING_CONTRACT_ADDRESS=
FARMING_CONTRACT_ADDRESS=

# =============================================================================
# 보안 설정
# =============================================================================
HTTPS=${environment === 'production' ? 'true' : 'false'}
SECURITY_LEVEL=${environment.toUpperCase()}
RATE_LIMIT_ENABLED=${environment === 'production' ? 'true' : 'false'}
IP_REPUTATION_ENABLED=${environment === 'production' ? 'true' : 'false'}
CRYPTO_SECURITY_LEVEL=${environment === 'production' ? 'HIGH' : 'LOW'}

# Rate Limiting 설정
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_DELAY_MS=1000

# CORS 설정
CORS_ORIGIN=${environment === 'production' ? 'https://trendy.storydot.kr' : 'http://localhost:5173'}
CORS_CREDENTIALS=true

# =============================================================================
# 에러 처리 및 로깅
# =============================================================================
ERROR_LEAK_PREVENTION=true
DETAILED_ERRORS=${environment === 'development' ? 'true' : 'false'}
SECURITY_LOGGING=true
LOG_LEVEL=${environment === 'production' ? 'warn' : 'debug'}
LOG_FILE_PATH=./logs/xpswap.log

# =============================================================================
# SSL/TLS 설정 (프로덕션만)
# =============================================================================
${environment === 'production' ? `SSL_CERT_PATH=/etc/ssl/certs/xpswap.crt
SSL_KEY_PATH=/etc/ssl/private/xpswap.key
TLS_MIN_VERSION=1.2` : '# SSL 설정은 프로덕션에서만 필요'}

# =============================================================================
# 모니터링 및 알림
# =============================================================================
MONITORING_ENABLED=${environment === 'production' ? 'true' : 'false'}
ALERT_WEBHOOK_URL=${environment === 'production' ? 'REPLACE_WITH_SLACK_WEBHOOK_URL' : ''}
PERFORMANCE_MONITORING=true

# =============================================================================
# 캐시 설정
# =============================================================================
CACHE_TTL=60000
CACHE_MAX_SIZE=1000
REDIS_URL=${environment === 'production' ? 'redis://localhost:6379' : ''}

# =============================================================================
# 백업 및 복구
# =============================================================================
BACKUP_ENABLED=${environment === 'production' ? 'true' : 'false'}
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30

# =============================================================================
# 개발 도구 (개발환경만)
# =============================================================================
${environment === 'development' ? `DEBUG=xpswap:*
ENABLE_SWAGGER=true
HOT_RELOAD=true` : '# 개발 도구는 개발환경에서만 활성화'}

# =============================================================================
# 마지막 업데이트
# =============================================================================
CONFIG_VERSION=2.0
LAST_UPDATED=${timestamp}
`;

    return envContent;
  }

  /**
   * 기존 .env 파일 백업
   */
  static backupExistingEnvFile(envPath: string): string | null {
    if (!fs.existsSync(envPath)) {
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${envPath}.backup.${timestamp}`;
    
    try {
      fs.copyFileSync(envPath, backupPath);
      console.log(`✅ 기존 환경 파일을 백업했습니다: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error(`❌ 환경 파일 백업 실패:`, error);
      return null;
    }
  }

  /**
   * 보안 감사 리포트 생성
   */
  static generateSecurityAuditReport(envPath: string): string {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars: Record<string, string> = {};
      
      // 환경 변수 파싱
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      });

      const validation = this.validateEnvironmentSecurity(envVars);
      const timestamp = new Date().toISOString();

      const report = `# XPSwap 보안 감사 리포트
생성일: ${timestamp}
환경 파일: ${envPath}

## 전체 보안 상태
상태: ${validation.isValid ? '✅ 양호' : '⚠️  개선 필요'}
발견된 문제: ${validation.issues.length}개
권장사항: ${validation.recommendations.length}개

## 보안 검사 항목

### 🔐 필수 보안 키
- SESSION_SECRET: ${envVars.SESSION_SECRET ? (envVars.SESSION_SECRET.length >= 32 ? '✅ 안전' : '⚠️  약함') : '❌ 누락'}
- JWT_SECRET: ${envVars.JWT_SECRET ? (envVars.JWT_SECRET.length >= 32 ? '✅ 안전' : '⚠️  약함') : '❌ 누락'}
- ENCRYPTION_KEY: ${envVars.ENCRYPTION_KEY ? '✅ 설정됨' : '❌ 누락'}

### 🌐 외부 API 키
- COINMARKETCAP_API_KEY: ${envVars.COINMARKETCAP_API_KEY?.includes('YOUR_') ? '❌ 플레이스홀더' : (envVars.COINMARKETCAP_API_KEY ? '✅ 설정됨' : '❌ 누락')}
- INFURA_PROJECT_ID: ${envVars.INFURA_PROJECT_ID?.includes('YOUR_') ? '❌ 플레이스홀더' : (envVars.INFURA_PROJECT_ID ? '✅ 설정됨' : '❌ 누락')}
- ALCHEMY_API_KEY: ${envVars.ALCHEMY_API_KEY?.includes('YOUR_') ? '❌ 플레이스홀더' : (envVars.ALCHEMY_API_KEY ? '✅ 설정됨' : '❌ 누락')}

### 🔒 보안 설정
- HTTPS: ${envVars.HTTPS === 'true' ? '✅ 활성화' : '⚠️  비활성화'}
- RATE_LIMIT_ENABLED: ${envVars.RATE_LIMIT_ENABLED === 'true' ? '✅ 활성화' : '⚠️  비활성화'}
- ERROR_LEAK_PREVENTION: ${envVars.ERROR_LEAK_PREVENTION === 'true' ? '✅ 활성화' : '⚠️  비활성화'}

### 📊 환경별 설정
- NODE_ENV: ${envVars.NODE_ENV || '❌ 누락'}
- SECURITY_LEVEL: ${envVars.SECURITY_LEVEL || '❌ 누락'}
- DETAILED_ERRORS: ${envVars.DETAILED_ERRORS}

## 발견된 문제
${validation.issues.length > 0 ? validation.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n') : '문제가 발견되지 않았습니다.'}

## 권장사항
${validation.recommendations.length > 0 ? validation.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n') : '추가 권장사항이 없습니다.'}

## 다음 단계
1. 위의 모든 문제를 해결하세요.
2. API 키들을 실제 값으로 교체하세요.
3. 프로덕션 환경에서는 보안 설정을 최고 수준으로 설정하세요.
4. 정기적으로 보안 감사를 수행하세요.

---
이 리포트는 자동 생성되었습니다. 추가 보안 검토가 필요할 수 있습니다.
`;

      return report;
    } catch (error) {
      return `보안 감사 리포트 생성 실패: ${error}`;
    }
  }
}

// CLI 도구로 사용할 수 있는 메인 함수
async function main() {
  // ES Module에서는 import.meta.url을 사용하여 메인 모듈인지 확인
  const currentModuleUrl = new URL(import.meta.url).pathname;
  const mainModulePath = process.argv[1];
  const isMainModule = currentModuleUrl === mainModulePath || currentModuleUrl.endsWith(mainModulePath);
  
  if (isMainModule) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'generate':
        const env = args[1] as 'development' | 'production' || 'development';
        const content = SecurityKeyGenerator.generateSecureEnvFile(env);
        const filename = `.env${env === 'production' ? '.production' : ''}.secure`;
        fs.writeFileSync(filename, content);
        console.log(`✅ 보안 강화된 환경 파일이 생성되었습니다: ${filename}`);
        break;
        
      case 'audit':
        const envPath = args[1] || '.env';
        const report = SecurityKeyGenerator.generateSecurityAuditReport(envPath);
        const reportPath = 'security-audit-report.md';
        fs.writeFileSync(reportPath, report);
        console.log(`✅ 보안 감사 리포트가 생성되었습니다: ${reportPath}`);
        break;
        
      case 'keys':
        const keys = SecurityKeyGenerator.generateSecurityEnvSet();
        console.log('🔐 생성된 보안 키:');
        Object.entries(keys).forEach(([key, value]) => {
          console.log(`${key}=${value}`);
        });
        break;
        
      default:
        console.log(`
사용법:
  node security-keys.js generate [development|production] - 보안 환경 파일 생성
  node security-keys.js audit [.env 파일 경로] - 보안 감사 수행
  node security-keys.js keys - 보안 키만 생성
        `);
    }
  }
}

// 메인 함수 실행
main().catch(console.error);
