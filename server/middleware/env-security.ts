/**
 * Environment Variable Security Manager
 * Handles secure environment variable validation and management
 */
import crypto from 'crypto';

// 환경변수 보안 검증 인터페이스
interface EnvSecurityConfig {
  required: string[];
  sensitive: string[];
  defaults: Record<string, string>;
  validators: Record<string, (value: string) => boolean>;
}

// 보안 환경변수 설정
const envSecurityConfig: EnvSecurityConfig = {
  // 필수 환경변수 목록
  required: [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'XPHERE_RPC_URL'
  ],
  
  // 민감한 환경변수 목록 (로그에서 마스킹됨)
  sensitive: [
    'COINMARKETCAP_API_KEY',
    'SESSION_SECRET',
    'DEPLOYER_PRIVATE_KEY',
    'VITE_INFURA_API_URL',
    'VITE_ALCHEMY_API_URL',
    'VITE_LIFI_API_KEY',
    'ENCRYPTION_KEY'
  ],
  
  // 안전한 기본값 (개발 환경용)
  defaults: {
    'NODE_ENV': 'development',
    'PORT': '5000',
    'HOST': 'localhost',
    'HTTPS': 'false',
    'SECURITY_LEVEL': 'DEVELOPMENT',
    'RATE_LIMIT_ENABLED': 'false',
    'ERROR_LEAK_PREVENTION': 'true',
    'DETAILED_ERRORS': 'true',
    'SECURITY_LOGGING': 'true',
    'BASE_PATH': '',
    'GAS_PRICE': '20000000000',
    'GAS_LIMIT': '8000000',
    'XPHERE_CHAIN_ID': '20250217'
  },
  
  // 환경변수 검증 함수들
  validators: {
    'PORT': (value: string) => {
      const port = parseInt(value);
      return !isNaN(port) && port > 0 && port < 65536;
    },
    'XPHERE_RPC_URL': (value: string) => {
      try {
        new URL(value);
        return value.startsWith('https://');
      } catch {
        return false;
      }
    },
    'XPHERE_CHAIN_ID': (value: string) => {
      const chainId = parseInt(value);
      return !isNaN(chainId) && chainId > 0;
    },
    'SESSION_SECRET': (value: string) => {
      // 개발 환경에서는 플레이스홀더도 허용
      if (process.env.NODE_ENV === 'development') {
        return value.length >= 10;
      }
      // 프로덕션에서는 강력한 시크릿 요구
      return value.length >= 32 && !/CHANGE|YOUR|PLACEHOLDER|EXAMPLE/i.test(value);
    }
  }
};

// 안전한 세션 시크릿 생성
export const generateSecureSessionSecret = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

// 환경변수 마스킹 (로깅용)
export const maskSensitiveValue = (key: string, value: string): string => {
  if (envSecurityConfig.sensitive.includes(key)) {
    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
  }
  return value;
};

// 플레이스홀더 값 감지
export const isPlaceholderValue = (value: string): boolean => {
  const placeholderPatterns = [
    /YOUR_.+_HERE/i,
    /CHANGE_THIS/i,
    /PLACEHOLDER/i,
    /EXAMPLE/i,
    /YOUR_.+_KEY/i,
    /YOUR_.+_URL/i
  ];
  
  return placeholderPatterns.some(pattern => pattern.test(value));
};

// 환경변수 보안 검증
export const validateEnvironmentSecurity = (): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  placeholders: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const placeholders: string[] = [];
  
  // 필수 환경변수 확인
  for (const key of envSecurityConfig.required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }
  
  // 환경변수 형식 검증
  for (const [key, validator] of Object.entries(envSecurityConfig.validators)) {
    const value = process.env[key];
    if (value && !validator(value)) {
      errors.push(`Invalid format for environment variable: ${key}`);
    }
  }
  
  // 플레이스홀더 값 감지
  for (const key of envSecurityConfig.sensitive) {
    const value = process.env[key];
    if (value && isPlaceholderValue(value)) {
      placeholders.push(key);
      if (process.env.NODE_ENV === 'production') {
        errors.push(`Placeholder value detected in production for: ${key}`);
      } else {
        warnings.push(`Using placeholder value (development only): ${key}`);
      }
    }
  }
  
  // 프로덕션 환경 추가 검증
  if (process.env.NODE_ENV === 'production') {
    // HTTPS 강제
    if (process.env.HTTPS !== 'true') {
      warnings.push('HTTPS is not enabled in production');
    }
    
    // 보안 레벨 확인
    if (process.env.SECURITY_LEVEL !== 'PRODUCTION') {
      warnings.push('Security level is not set to PRODUCTION');
    }
    
    // Rate limiting 확인
    if (process.env.RATE_LIMIT_ENABLED !== 'true') {
      warnings.push('Rate limiting is not enabled in production');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    placeholders
  };
};

// 기본값 적용
export const applyEnvironmentDefaults = (): void => {
  for (const [key, defaultValue] of Object.entries(envSecurityConfig.defaults)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }
  
  // 세션 시크릿 자동 생성 (개발 환경)
  if (!process.env.SESSION_SECRET || isPlaceholderValue(process.env.SESSION_SECRET)) {
    if (process.env.NODE_ENV === 'development') {
      process.env.SESSION_SECRET = generateSecureSessionSecret();
      console.log('⚠️ Using auto-generated session secret (development only)');
    }
  }
};

// 환경변수 보안 상태 리포트
export const getEnvironmentSecurityReport = () => {
  const validation = validateEnvironmentSecurity();
  
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    securityLevel: process.env.SECURITY_LEVEL || 'UNKNOWN',
    validation,
    summary: {
      totalVariables: Object.keys(process.env).length,
      sensitiveVariables: envSecurityConfig.sensitive.length,
      requiredVariables: envSecurityConfig.required.length,
      placeholderCount: validation.placeholders.length,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length
    }
  };
};

// 환경변수 초기화 함수
export const initializeEnvironmentSecurity = (): boolean => {
  console.log('🔐 Initializing Environment Security...');
  
  // 기본값 적용
  applyEnvironmentDefaults();
  
  // 보안 검증
  const validation = validateEnvironmentSecurity();
  
  // 에러 출력
  if (validation.errors.length > 0) {
    console.error('❌ Environment Security Errors:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  // 경고 출력
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warning: Using placeholder values (development only):');
    validation.placeholders.forEach(key => console.warn(`  - ${key}`));
  }
  
  if (validation.isValid) {
    console.log('✅ Environment variables validation passed');
  } else {
    console.error('❌ Environment variables validation failed');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment security validation failed in production');
    }
  }
  
  return validation.isValid;
};

// Express 미들웨어로 사용할 환경변수 체크
export const environmentSecurityMiddleware = (req: any, res: any, next: any) => {
  // 요청 헤더에 환경 정보 추가 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-Environment', process.env.NODE_ENV);
    res.setHeader('X-Security-Level', process.env.SECURITY_LEVEL || 'UNKNOWN');
  }
  
  next();
};

export default {
  validateEnvironmentSecurity,
  applyEnvironmentDefaults,
  initializeEnvironmentSecurity,
  getEnvironmentSecurityReport,
  environmentSecurityMiddleware,
  maskSensitiveValue,
  isPlaceholderValue,
  generateSecureSessionSecret
};
