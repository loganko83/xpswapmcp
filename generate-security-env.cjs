const crypto = require('crypto');
const fs = require('fs');

// 보안 키 생성 유틸리티
class SecurityKeyGenerator {
  
  /**
   * 강력한 랜덤 문자열 생성
   */
  static generateSecureRandomString(length = 64, includeSpecialChars = true) {
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
  static generateJWTSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Session Secret 생성
   */
  static generateSessionSecret() {
    return crypto.randomBytes(64).toString('base64url');
  }

  /**
   * API 키 생성 (UUID 기반)
   */
  static generateAPIKey() {
    return crypto.randomUUID() + '-' + crypto.randomUUID();
  }

  /**
   * 암호화 키 생성 (AES-256)
   */
  static generateEncryptionKey() {
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
   * 보안 강화된 .env 파일 생성
   */
  static generateSecureEnvFile(environment) {
    const securityKeys = this.generateSecurityEnvSet();
    const timestamp = new Date().toISOString();
    
    return `# XPSwap 보안 강화 환경 설정 (${environment})
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
# 캐시 설정
# =============================================================================
CACHE_TTL=60000
CACHE_MAX_SIZE=1000
REDIS_URL=${environment === 'production' ? 'redis://localhost:6379' : ''}

# =============================================================================
# 모니터링 및 알림
# =============================================================================
MONITORING_ENABLED=${environment === 'production' ? 'true' : 'false'}
ALERT_WEBHOOK_URL=${environment === 'production' ? 'REPLACE_WITH_SLACK_WEBHOOK_URL' : ''}
PERFORMANCE_MONITORING=true

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
  }
}

// 메인 실행
console.log('🔐 XPSwap 보안 환경 설정 생성기');
console.log('=====================================');

// 개발환경용 보안 .env 생성
const devContent = SecurityKeyGenerator.generateSecureEnvFile('development');
fs.writeFileSync('.env.secure', devContent);
console.log('✅ 개발환경 보안 파일 생성: .env.secure');

// 프로덕션환경용 보안 .env 생성  
const prodContent = SecurityKeyGenerator.generateSecureEnvFile('production');
fs.writeFileSync('.env.production.secure', prodContent);
console.log('✅ 프로덕션 보안 파일 생성: .env.production.secure');

// 보안 키 세트 출력
const keys = SecurityKeyGenerator.generateSecurityEnvSet();
console.log('\n🔐 생성된 보안 키 샘플:');
console.log('SESSION_SECRET=' + keys.SESSION_SECRET.substring(0, 20) + '...');
console.log('JWT_SECRET=' + keys.JWT_SECRET.substring(0, 20) + '...');
console.log('ENCRYPTION_KEY=' + keys.ENCRYPTION_KEY.substring(0, 20) + '...');

console.log('\n📋 다음 단계:');
console.log('1. .env.secure 파일의 API 키들을 실제 값으로 교체하세요');
console.log('2. 기존 .env 파일을 백업 후 .env.secure로 교체하세요');
console.log('3. 프로덕션 배포 시 .env.production.secure를 사용하세요');
console.log('4. 보안 키들을 안전한 곳에 보관하세요');
