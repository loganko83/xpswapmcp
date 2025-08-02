/**
 * XPSwap XSS Protection and Input Validation
 * Phase 3.2: Cross-Site Scripting (XSS) Prevention
 * 
 * 프론트엔드와 백엔드에서 XSS 공격을 방지하고 입력값을 검증
 */

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'address' | 'custom';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  sanitize?: boolean;
  allowHtml?: boolean;
}

interface ValidationSchema {
  [field: string]: ValidationRule;
}

interface ValidationResult {
  isValid: boolean;
  errors: { [field: string]: string };
  sanitizedData: { [field: string]: any };
}

class XSSProtectionManager {
  private static instance: XSSProtectionManager;
  private purifyConfig: any;

  constructor() {
    this.purifyConfig = {
      ALLOWED_TAGS: [], // 기본적으로 모든 HTML 태그 제거
      ALLOWED_ATTR: [], // 기본적으로 모든 속성 제거
      KEEP_CONTENT: true, // 태그는 제거하되 내용은 유지
      ALLOW_DATA_ATTR: false,
      USE_PROFILES: { html: false }
    };
  }

  static getInstance(): XSSProtectionManager {
    if (!XSSProtectionManager.instance) {
      XSSProtectionManager.instance = new XSSProtectionManager();
    }
    return XSSProtectionManager.instance;
  }

  /**
   * 문자열 새니타이징 (XSS 방지)
   */
  sanitizeString(input: string, allowHtml: boolean = false): string {
    if (typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    if (allowHtml) {
      // HTML 허용 시 제한적 태그만 허용
      const htmlConfig = {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
      };
      sanitized = DOMPurify.sanitize(input, htmlConfig);
    } else {
      // HTML 완전 제거
      sanitized = DOMPurify.sanitize(input, this.purifyConfig);
    }

    // 추가 XSS 패턴 제거
    sanitized = this.removeXSSPatterns(sanitized);

    return sanitized.trim();
  }

  /**
   * 추가 XSS 패턴 제거
   */
  private removeXSSPatterns(input: string): string {
    const xssPatterns = [
      // JavaScript 실행 패턴
      /javascript:/gi,
      /vbscript:/gi,
      /onload/gi,
      /onerror/gi,
      /onclick/gi,
      /onmouseover/gi,
      /onfocus/gi,
      /onblur/gi,
      // Data URL 스키마
      /data:text\/html/gi,
      // Expression 패턴
      /expression\s*\(/gi,
      // 기타 위험한 패턴
      /<script/gi,
      /<\/script>/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];

    let sanitized = input;
    xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  }

  /**
   * 객체의 모든 문자열 값 새니타이징
   */
  sanitizeObject(obj: any, allowHtml: boolean = false): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj, allowHtml);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, allowHtml));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value, allowHtml);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * 블록체인 주소 검증
   */
  validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }

    // 이더리움 주소 형식 검증 (0x + 40자 hex)
    const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressPattern.test(address);
  }

  /**
   * 토큰 금액 검증
   */
  validateTokenAmount(amount: string | number): boolean {
    if (amount === null || amount === undefined) {
      return false;
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // NaN, Infinity, 음수 체크
    if (isNaN(numAmount) || !isFinite(numAmount) || numAmount < 0) {
      return false;
    }

    // 최대 소수점 18자리까지 허용 (Wei precision)
    const decimalPlaces = amount.toString().split('.')[1]?.length || 0;
    if (decimalPlaces > 18) {
      return false;
    }

    return true;
  }

  /**
   * URL 검증
   */
  validateUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const parsedUrl = new URL(url);
      // HTTPS만 허용
      if (parsedUrl.protocol !== 'https:') {
        return false;
      }
      
      // 허용된 도메인 체크
      const allowedDomains = [
        'api.coingecko.com',
        'api.coinmarketcap.com',
        'www.ankr.com',
        'li.quest'
      ];
      
      return allowedDomains.some(domain => parsedUrl.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  /**
   * 입력값 종합 검증
   */
  validateInput(data: any, schema: ValidationSchema): ValidationResult {
    const errors: { [field: string]: string } = {};
    const sanitizedData: { [field: string]: any } = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];

      // 필수 필드 체크
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      // 값이 없으면 스킵 (필수가 아닌 경우)
      if (value === undefined || value === null || value === '') {
        sanitizedData[field] = value;
        continue;
      }

      // 타입별 검증
      let isValid = true;
      let sanitizedValue = value;

      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors[field] = `${field} must be a string`;
            isValid = false;
          } else {
            sanitizedValue = rule.sanitize ? this.sanitizeString(value, rule.allowHtml) : value;
            
            if (rule.minLength && sanitizedValue.length < rule.minLength) {
              errors[field] = `${field} must be at least ${rule.minLength} characters`;
              isValid = false;
            }
            if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
              errors[field] = `${field} must be no more than ${rule.maxLength} characters`;
              isValid = false;
            }
            if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
              errors[field] = `${field} format is invalid`;
              isValid = false;
            }
          }
          break;

        case 'number':
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (isNaN(numValue) || !isFinite(numValue)) {
            errors[field] = `${field} must be a valid number`;
            isValid = false;
          } else {
            sanitizedValue = numValue;
            if (rule.min !== undefined && numValue < rule.min) {
              errors[field] = `${field} must be at least ${rule.min}`;
              isValid = false;
            }
            if (rule.max !== undefined && numValue > rule.max) {
              errors[field] = `${field} must be no more than ${rule.max}`;
              isValid = false;
            }
          }
          break;

        case 'email':
          if (!validator.isEmail(value)) {
            errors[field] = `${field} must be a valid email`;
            isValid = false;
          } else {
            sanitizedValue = validator.normalizeEmail(value) || value;
          }
          break;

        case 'url':
          if (!this.validateUrl(value)) {
            errors[field] = `${field} must be a valid HTTPS URL`;
            isValid = false;
          }
          break;

        case 'address':
          if (!this.validateAddress(value)) {
            errors[field] = `${field} must be a valid blockchain address`;
            isValid = false;
          }
          break;

        case 'custom':
          if (rule.customValidator && !rule.customValidator(value)) {
            errors[field] = `${field} validation failed`;
            isValid = false;
          }
          break;
      }

      if (isValid) {
        sanitizedData[field] = sanitizedValue;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }
}

/**
 * DeFi 특화 검증 스키마
 */
export const DeFiValidationSchemas = {
  // 토큰 스왑 요청
  swapRequest: {
    tokenIn: { type: 'address' as const, required: true },
    tokenOut: { type: 'address' as const, required: true },
    amountIn: { 
      type: 'string' as const, 
      required: true,
      customValidator: (value: string) => XSSProtectionManager.getInstance().validateTokenAmount(value)
    },
    slippage: { 
      type: 'number' as const, 
      required: true, 
      min: 0.01, 
      max: 50 
    },
    deadline: { 
      type: 'number' as const, 
      required: true,
      min: Math.floor(Date.now() / 1000)
    },
    recipient: { type: 'address' as const, required: false }
  },

  // 유동성 추가 요청
  liquidityAdd: {
    tokenA: { type: 'address' as const, required: true },
    tokenB: { type: 'address' as const, required: true },
    amountA: { 
      type: 'string' as const, 
      required: true,
      customValidator: (value: string) => XSSProtectionManager.getInstance().validateTokenAmount(value)
    },
    amountB: { 
      type: 'string' as const, 
      required: true,
      customValidator: (value: string) => XSSProtectionManager.getInstance().validateTokenAmount(value)
    },
    slippage: { type: 'number' as const, required: true, min: 0.01, max: 50 },
    deadline: { 
      type: 'number' as const, 
      required: true,
      min: Math.floor(Date.now() / 1000)
    }
  },

  // 사용자 입력 (폼 데이터)
  userInput: {
    name: { 
      type: 'string' as const, 
      required: false, 
      maxLength: 50, 
      sanitize: true 
    },
    email: { 
      type: 'email' as const, 
      required: false 
    },
    message: { 
      type: 'string' as const, 
      required: false, 
      maxLength: 1000, 
      sanitize: true 
    }
  },

  // API 요청 공통 파라미터
  apiRequest: {
    page: { type: 'number' as const, required: false, min: 1, max: 1000 },
    limit: { type: 'number' as const, required: false, min: 1, max: 100 },
    search: { 
      type: 'string' as const, 
      required: false, 
      maxLength: 100, 
      sanitize: true 
    },
    sortBy: { 
      type: 'string' as const, 
      required: false,
      pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
    },
    sortOrder: { 
      type: 'string' as const, 
      required: false,
      pattern: /^(asc|desc)$/
    }
  }
};

/**
 * Express 미들웨어 생성 함수
 */
export function createXSSProtectionMiddleware() {
  const xssProtection = XSSProtectionManager.getInstance();

  return (req: any, res: any, next: any) => {
    // 요청 본문 새니타이징
    if (req.body && typeof req.body === 'object') {
      req.body = xssProtection.sanitizeObject(req.body);
    }

    // 쿼리 파라미터 새니타이징
    if (req.query && typeof req.query === 'object') {
      req.query = xssProtection.sanitizeObject(req.query);
    }

    // 파라미터 새니타이징
    if (req.params && typeof req.params === 'object') {
      req.params = xssProtection.sanitizeObject(req.params);
    }

    next();
  };
}

/**
 * 검증 미들웨어 생성 함수
 */
export function createValidationMiddleware(schema: ValidationSchema) {
  const xssProtection = XSSProtectionManager.getInstance();

  return (req: any, res: any, next: any) => {
    const dataToValidate = { ...req.body, ...req.query, ...req.params };
    const validation = xssProtection.validateInput(dataToValidate, schema);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // 검증된 데이터를 req.validated에 저장
    req.validated = validation.sanitizedData;
    next();
  };
}

export default XSSProtectionManager;